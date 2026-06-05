"use client";

import * as React from "react";

import { AddServiceStatusForm } from "@/components/status/AddServiceStatusForm";
import { AutoDismissMessage } from "@/components/status/AutoDismissMessage";
import { ServiceStatusRowCard } from "@/components/status/ServiceStatusRow";
import type { ServiceStatusRow } from "@/lib/service-status";

export function ServiceStatusPageContent({
  rows,
  isAdmin,
}: {
  rows: ServiceStatusRow[];
  isAdmin: boolean;
}) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleError = React.useCallback((message: string) => {
    setErrorMessage(message);
  }, []);

  const dismissError = React.useCallback(() => {
    setErrorMessage(null);
  }, []);

  return (
    <div className="flex w-full flex-col gap-4">
      {errorMessage ? (
        <AutoDismissMessage
          message={errorMessage}
          onDismiss={dismissError}
        />
      ) : null}

      {isAdmin ? <AddServiceStatusForm onError={handleError} /> : null}

      {rows.length === 0 ? (
        !isAdmin ? (
          <p className="rounded-xl border bg-card px-5 py-8 text-center text-muted-foreground">
            Trenutno nema vozila na servisu.
          </p>
        ) : null
      ) : (
        rows.map((row) => (
          <ServiceStatusRowCard
            key={row.id}
            row={row}
            isAdmin={isAdmin}
            onError={handleError}
          />
        ))
      )}
    </div>
  );
}
