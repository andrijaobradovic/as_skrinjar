import Link from "next/link";

import { CarGrid } from "@/components/cars/CarGrid";
import { NewsletterForm } from "@/components/cars/NewsletterForm";
import { Button } from "@/components/ui/button";
import type { CarListItem } from "@/lib/cars";

export function CarsPageContent({
  initialCars,
  initialHasMore,
  initialError,
  isAdmin,
}: {
  initialCars: CarListItem[];
  initialHasMore: boolean;
  initialError: string | null;
  isAdmin: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-10">
      {isAdmin ? (
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/automobili/novi">Dodaj oglas</Link>
          </Button>
        </div>
      ) : null}

      <NewsletterForm />

      <CarGrid
        initialCars={initialCars}
        initialHasMore={initialHasMore}
        initialError={initialError}
      />
    </div>
  );
}
