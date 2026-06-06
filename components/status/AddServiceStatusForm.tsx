"use client";

import * as React from "react";
import { useActionState } from "react";

import {
  addServiceStatus,
  type StatusActionResult,
} from "@/app/status/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusSelect } from "@/components/status/StatusSelect";
import {
  DEFAULT_SERVICE_STATUS,
  MAX_TABLICE_LENGTH,
  type ServiceStatusValue,
} from "@/lib/service-status";
import { cn } from "@/lib/utils";

export function AddServiceStatusForm({
  onError,
}: {
  onError: (message: string) => void;
}) {
  const [status, setStatus] =
    React.useState<ServiceStatusValue>(DEFAULT_SERVICE_STATUS);

  const action = React.useCallback(
    async (prevState: StatusActionResult | null, formData: FormData) => {
      formData.set("status", status);
      const result = await addServiceStatus(prevState, formData);

      if ("error" in result) {
        onError(result.error);
      }

      return result;
    },
    [onError, status]
  );

  const [state, formAction, isPending] = useActionState(action, null);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state && "success" in state) {
      formRef.current?.reset();
      setStatus(DEFAULT_SERVICE_STATUS);
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
        name="tablice"
        placeholder="Broj tablica"
        required
        disabled={isPending}
        maxLength={MAX_TABLICE_LENGTH}
        className="h-auto max-w-full px-3 py-1 text-center text-lg font-bold sm:h-11 sm:max-w-xs sm:text-left"
        aria-label="Broj tablica"
      />

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
        <StatusSelect
          value={status}
          onValueChange={setStatus}
          disabled={isPending}
          compact
        />

        <Button
          type="submit"
          disabled={isPending}
          className="h-auto px-3 py-1 text-lg font-bold sm:h-8 sm:px-2.5 sm:text-sm sm:font-medium"
        >
          Dodaj
        </Button>
      </div>
    </form>
  );
}
