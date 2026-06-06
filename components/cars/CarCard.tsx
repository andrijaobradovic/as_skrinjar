"use client";

import Link from "next/link";

import { CarImage } from "@/components/cars/CarImage";
import { Card } from "@/components/ui/card";
import {
  AUTOMOBILI_COUNT_KEY,
  AUTOMOBILI_RESTORE_KEY,
  AUTOMOBILI_SCROLL_KEY,
  buildCarCardDetails,
  buildCarTitle,
  formatPriceEur,
  type CarListItem,
} from "@/lib/cars";
import { cn } from "@/lib/utils";

export function CarCard({
  car,
  displayedCount,
  priority = false,
}: {
  car: CarListItem;
  displayedCount: number;
  priority?: boolean;
}) {
  function handleNavigate() {
    sessionStorage.setItem(AUTOMOBILI_SCROLL_KEY, String(window.scrollY));
    sessionStorage.setItem(AUTOMOBILI_COUNT_KEY, String(displayedCount));
    sessionStorage.setItem(AUTOMOBILI_RESTORE_KEY, "true");
  }

  const title = buildCarTitle(car.marka, car.model);

  return (
    <Link
      href={`/automobili/${car.id}`}
      onClick={handleNavigate}
      className="block h-full"
    >
      <Card
        className={cn(
          "h-full gap-0 overflow-hidden rounded-xl border bg-card py-0 shadow-sm",
          "transition-colors duration-200 hover:border-primary"
        )}
      >
        <CarImage images={car.car_images} alt={title} priority={priority} />

        <div className="flex h-[8.5rem] flex-col gap-2 p-4">
          <p className="truncate text-lg font-semibold tracking-tight">{title}</p>

          <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
            {buildCarCardDetails(car)}
          </p>

          <p className="mt-auto shrink-0 text-sm font-bold text-foreground">
            Cena: {formatPriceEur(car.cena_eur)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
