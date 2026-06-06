"use client";

import Link from "next/link";
import * as React from "react";

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
  const [openInNewTab, setOpenInNewTab] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setOpenInNewTab(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  function handleNavigate() {
    sessionStorage.setItem(AUTOMOBILI_SCROLL_KEY, String(window.scrollY));
    sessionStorage.setItem(AUTOMOBILI_COUNT_KEY, String(displayedCount));
    sessionStorage.setItem(AUTOMOBILI_RESTORE_KEY, "true");
  }

  const title = buildCarTitle(car.marka, car.model);

  return (
    <Link
      href={`/automobili/${car.id}`}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
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

        <div className="flex min-h-[7.5rem] flex-col gap-2 p-4">
          <p className="truncate text-lg font-semibold tracking-tight">{title}</p>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {buildCarCardDetails(car)}
          </p>

          <p className="mt-auto text-sm font-bold text-foreground">
            Cena: {formatPriceEur(car.cena_eur)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
