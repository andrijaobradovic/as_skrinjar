"use client";

import * as React from "react";
import { toast } from "sonner";

import { deleteSubscriber } from "@/app/automobili/newsletter-prijave/actions";
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
import { formatSubscriberDate, type SubscriberRow } from "@/lib/subscribers";
import { cn } from "@/lib/utils";

export function SubscriberRowCard({
  row,
  onDeleted,
}: {
  row: SubscriberRow;
  onDeleted: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteSubscriber(row.id);
    setIsDeleting(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    onDeleted(row.id);
    toast.success("Prijava je obrisana.");
  }

  return (
    <article
      className={cn(
        "rounded-xl border bg-card px-5 py-4 shadow-sm",
        "flex flex-col items-center gap-3 text-center",
        "sm:flex-row sm:items-center sm:justify-between sm:text-left"
      )}
    >
      <p className="min-w-0 break-all text-sm text-muted-foreground">
        {row.email}
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-sm text-muted-foreground">
          {formatSubscriberDate(row.created_at)}
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={isDeleting}
              className="h-auto px-3 py-1 text-lg font-bold sm:h-8 sm:px-2.5 sm:text-sm sm:font-medium"
            >
              Obriši
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Brisanje prijave</AlertDialogTitle>
              <AlertDialogDescription>
                Da li ste sigurni da želite da obrišete ovu prijavu?
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
      </div>
    </article>
  );
}
