"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";

import {
  addSubscriberAdmin,
  type SubscriberActionResult,
} from "@/app/automobili/newsletter-prijave/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AddSubscriberForm({
  onAdded,
}: {
  onAdded: () => void;
}) {
  const action = React.useCallback(
    async (prevState: SubscriberActionResult | null, formData: FormData) => {
      const result = await addSubscriberAdmin(prevState, formData);

      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Mejl je uspešno prijavljen.");
        onAdded();
      }

      return result;
    },
    [onAdded]
  );

  const [state, formAction, isPending] = useActionState(action, null);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state && "success" in state) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={cn(
        "rounded-xl border border-dashed bg-card px-5 py-4 shadow-sm",
        "flex flex-col items-center gap-3 text-center",
        "sm:flex-row sm:items-center sm:justify-between sm:text-left"
      )}
    >
      <Input
        name="email"
        type="email"
        placeholder="vaš@email.com"
        autoComplete="email"
        required
        disabled={isPending}
        className="h-auto max-w-full px-3 py-1 text-center text-lg font-bold sm:h-10 sm:max-w-md sm:text-left"
        aria-label="E-mail adresa"
      />

      <Button type="submit" disabled={isPending} className="h-10 shrink-0 px-5 sm:min-w-32">
        Prijavi
      </Button>
    </form>
  );
}
