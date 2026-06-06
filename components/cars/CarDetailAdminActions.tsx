"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { deleteCar } from "@/app/automobili/actions";
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

export function CarDetailAdminActions({ carId }: { carId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setErrorMessage(null);

    const result = await deleteCar(carId);
    setIsDeleting(false);

    if ("error" in result) {
      setErrorMessage(result.error);
      return;
    }

    router.push("/automobili");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-start gap-3">
        <Button asChild>
          <Link href={`/automobili/${carId}/izmeni`}>Izmeni oglas</Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isDeleting}>Obriši oglas</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Brisanje oglasa</AlertDialogTitle>
              <AlertDialogDescription>
                Da li ste sigurni da želite da obrišete ovaj oglas?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Otkaži</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
              >
                {isDeleting ? "Brisanje…" : "Obriši"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
