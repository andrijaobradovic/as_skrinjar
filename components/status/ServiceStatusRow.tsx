"use client";

import * as React from "react";

import { deleteServiceStatus, updateServiceStatus } from "@/app/status/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status/StatusBadge";
import { StatusSelect } from "@/components/status/StatusSelect";
import type { ServiceStatusRow, ServiceStatusValue } from "@/lib/service-status";
import { cn } from "@/lib/utils";

export function ServiceStatusRowCard({
  row,
  isAdmin,
  onError,
}: {
  row: ServiceStatusRow;
  isAdmin: boolean;
  onError: (message: string) => void;
}) {
  const [status, setStatus] = React.useState(row.status);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    setStatus(row.status);
  }, [row.status]);

  async function handleStatusChange(nextStatus: ServiceStatusValue) {
    if (nextStatus === status) {
      return;
    }

    const previous = status;
    setStatus(nextStatus);
    setIsUpdating(true);

    const result = await updateServiceStatus(row.id, nextStatus);
    setIsUpdating(false);

    if ("error" in result) {
      setStatus(previous);
      onError(result.error);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteServiceStatus(row.id);
    setIsDeleting(false);

    if ("error" in result) {
      onError(result.error);
    }
  }

  return (
    <article
      className={cn(
        "rounded-xl border bg-card px-5 py-4 shadow-sm",
        "flex flex-col items-center gap-3 text-center",
        "sm:flex-row sm:items-center sm:justify-between sm:text-left"
      )}
    >
      <p className="text-lg font-bold tracking-tight sm:text-xl">{row.tablice}</p>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
        {isAdmin ? (
          <StatusSelect
            value={status}
            onValueChange={handleStatusChange}
            disabled={isUpdating || isDeleting}
            compact
          />
        ) : (
          <StatusBadge status={status} compact />
        )}

        {isAdmin ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isDeleting || isUpdating}
                className="h-auto px-3 py-1 text-lg font-bold sm:h-8 sm:px-2.5 sm:text-sm sm:font-medium"
              >
                Obriši
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Brisanje vozila</AlertDialogTitle>
                <AlertDialogDescription>
                  Da li ste sigurno da želite da obrišete status ovog
                  automobila?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Otkaži</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  Obriši
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
    </article>
  );
}
