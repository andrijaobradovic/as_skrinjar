"use client";

import * as React from "react";

import { subscribeToNewsletter } from "@/app/automobili/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateNewsletterEmail } from "@/lib/newsletter-validation";
import { cn } from "@/lib/utils";

const NEWSLETTER_TEXT =
  "Prijavite se e-mailom i budite prvi obavešteni kada objavimo novi automobil na prodaju.";
const SUCCESS_MESSAGE =
  "Hvala na prijavi! Obaveštenja o novim oglasima biće uskoro dostupna.";
const MESSAGE_VISIBLE_MS = 10_000;
const MESSAGE_FADE_MS = 500;

type MessageState = {
  text: string;
  variant: "success" | "error";
};

function StatusMessage({
  message,
  onDismiss,
}: {
  message: MessageState;
  onDismiss: () => void;
}) {
  const [isFading, setIsFading] = React.useState(false);

  React.useEffect(() => {
    const fadeTimer = window.setTimeout(() => setIsFading(true), MESSAGE_VISIBLE_MS);
    const hideTimer = window.setTimeout(() => {
      onDismiss();
    }, MESSAGE_VISIBLE_MS + MESSAGE_FADE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [message, onDismiss]);

  return (
    <p
      role={message.variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm transition-opacity duration-500",
        message.variant === "success"
          ? "border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400"
          : "border-destructive/30 bg-destructive/10 text-destructive",
        isFading && "opacity-0"
      )}
    >
      {message.text}
    </p>
  );
}

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [fieldError, setFieldError] = React.useState<string | undefined>();
  const [message, setMessage] = React.useState<MessageState | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const honeypot = String(formData.get("website") ?? "").trim();

    if (honeypot) {
      return;
    }

    const nextEmail = String(formData.get("email") ?? "");
    const error = validateNewsletterEmail(nextEmail);

    if (error) {
      setFieldError(error);
      setMessage({ text: error, variant: "error" });
      return;
    }

    setIsPending(true);
    const result = await subscribeToNewsletter(formData);
    setIsPending(false);

    if ("error" in result) {
      setFieldError(result.error);
      setMessage({ text: result.error, variant: "error" });
      return;
    }

    setFieldError(undefined);
    setMessage({ text: SUCCESS_MESSAGE, variant: "success" });
    setEmail("");
  }

  return (
    <div className="w-full space-y-4">
      <p className="text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
        {NEWSLETTER_TEXT}
      </p>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3" noValidate>
        <div
          className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
          aria-hidden="true"
        >
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        {message ? (
          <StatusMessage message={message} onDismiss={() => setMessage(null)} />
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Input
              id="newsletter-email"
              name="email"
              type="email"
              placeholder="vaš@email.com"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (fieldError) setFieldError(undefined);
              }}
              aria-invalid={!!fieldError}
              disabled={isPending}
              className="h-10"
            />
            {fieldError && !message ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldError}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-10 shrink-0 px-5 sm:min-w-32"
          >
            Prijavi se
          </Button>
        </div>
      </form>
    </div>
  );
}
