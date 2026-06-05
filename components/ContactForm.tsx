"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { submitContactForm, type ContactState } from "@/app/kontakt/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CONTACT_LIMITS,
  hasContactErrors,
  validateContactForm,
  type ContactFieldErrors,
} from "@/lib/contact-validation";
import { cn } from "@/lib/utils";

const SUCCESS_MESSAGE =
  "Vaša poruka je uspešno poslata. Javićemo vam se uskoro.";
const REQUIRED_FIELD_ERROR = "Obavezno polje";
const ERROR_VISIBLE_MS = 10_000;
const ERROR_FADE_MS = 500;

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className="h-9 w-full"
    >
      {pending ? "Slanje…" : "Pošalji"}
    </Button>
  );
}

function FieldError({
  message,
  onDismiss,
}: {
  message?: string;
  onDismiss?: () => void;
}) {
  const [displayMessage, setDisplayMessage] = useState<string | undefined>();
  const [isFading, setIsFading] = useState(false);
  const timersRef = useRef<{
    fade?: ReturnType<typeof setTimeout>;
    hide?: ReturnType<typeof setTimeout>;
  }>({});

  useEffect(() => {
    const clearTimers = () => {
      if (timersRef.current.fade) clearTimeout(timersRef.current.fade);
      if (timersRef.current.hide) clearTimeout(timersRef.current.hide);
      timersRef.current = {};
    };

    clearTimers();

    if (!message) {
      setDisplayMessage(undefined);
      setIsFading(false);
      return;
    }

    setDisplayMessage(message);
    setIsFading(false);

    if (message !== REQUIRED_FIELD_ERROR) {
      return clearTimers;
    }

    timersRef.current.fade = setTimeout(() => {
      setIsFading(true);
    }, ERROR_VISIBLE_MS);

    timersRef.current.hide = setTimeout(() => {
      setDisplayMessage(undefined);
      setIsFading(false);
      onDismiss?.();
    }, ERROR_VISIBLE_MS + ERROR_FADE_MS);

    return clearTimers;
  }, [message, onDismiss]);

  if (!displayMessage) return null;

  return (
    <p
      className={cn(
        "text-sm text-destructive transition-opacity duration-500",
        isFading && "opacity-0"
      )}
      role="alert"
    >
      {displayMessage}
    </p>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState<ContactState, FormData>(
    submitContactForm,
    null
  );
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [messageLength, setMessageLength] = useState(0);
  const [formKey, setFormKey] = useState(0);

  const messageOverLimit = messageLength > CONTACT_LIMITS.messageMax;

  const dismissFieldError = useCallback((field: keyof ContactFieldErrors) => {
    setFieldErrors((prev) => {
      if (prev[field] !== REQUIRED_FIELD_ERROR) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true);
      setFieldErrors({});
      setMessageLength(0);
      setFormKey((key) => key + 1);

      const timer = setTimeout(() => setShowSuccess(false), 10_000);
      return () => clearTimeout(timer);
    }

    if (state && !state.success && state.errors) {
      setFieldErrors(state.errors);
    }
  }, [state]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const values = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    const errors = validateContactForm(values);
    if (hasContactErrors(errors) || messageOverLimit) {
      event.preventDefault();
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
  }

  return (
    <form
      key={formKey}
      action={formAction}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      noValidate
    >
      <div
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
        aria-hidden="true"
      >
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {showSuccess ? (
        <p
          className="rounded-lg border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:text-green-400"
          role="status"
        >
          {SUCCESS_MESSAGE}
        </p>
      ) : null}

      {state && !state.success && state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Vaše ime"
          autoComplete="name"
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
        />
        <FieldError
          message={fieldErrors.name}
          onDismiss={() => dismissFieldError("name")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="vaš@email.com"
          autoComplete="email"
          aria-invalid={!!fieldErrors.email}
        />
        <FieldError
          message={fieldErrors.email}
          onDismiss={() => dismissFieldError("email")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="06x xxx xxxx"
          autoComplete="tel"
          aria-invalid={!!fieldErrors.phone}
        />
        <FieldError
          message={fieldErrors.phone}
          onDismiss={() => dismissFieldError("phone")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Input
          id="subject"
          name="subject"
          type="text"
          placeholder="Tema upita"
          maxLength={CONTACT_LIMITS.subjectMax}
          aria-invalid={!!fieldErrors.subject}
        />
        <FieldError
          message={fieldErrors.subject}
          onDismiss={() => dismissFieldError("subject")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Textarea
          id="message"
          name="message"
          placeholder="Vaša poruka…"
          rows={5}
          aria-invalid={!!fieldErrors.message || messageOverLimit}
          onChange={(event) => setMessageLength(event.target.value.length)}
        />
        <div className="flex items-start justify-between gap-2">
          <FieldError
            message={fieldErrors.message}
            onDismiss={() => dismissFieldError("message")}
          />
          <p
            className={cn(
              "ml-auto shrink-0 text-xs tabular-nums",
              messageOverLimit
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {messageLength}/{CONTACT_LIMITS.messageMax}
          </p>
        </div>
      </div>

      <SubmitButton disabled={messageOverLimit} />
    </form>
  );
}
