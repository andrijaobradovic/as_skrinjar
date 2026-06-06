"use client";

import * as React from "react";

import { loadMoreCars, restoreCarsList } from "@/app/automobili/actions";
import { CarCard } from "@/components/cars/CarCard";
import { Button } from "@/components/ui/button";
import {
  AUTOMOBILI_COUNT_KEY,
  AUTOMOBILI_RESTORE_KEY,
  AUTOMOBILI_SCROLL_KEY,
  CARS_PAGE_SIZE,
  type CarListItem,
} from "@/lib/cars";

export function CarGrid({
  initialCars,
  initialHasMore,
  initialError,
}: {
  initialCars: CarListItem[];
  initialHasMore: boolean;
  initialError: string | null;
}) {
  const [cars, setCars] = React.useState(initialCars);
  const [hasMore, setHasMore] = React.useState(initialHasMore);
  const [error, setError] = React.useState(initialError);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [isRetrying, setIsRetrying] = React.useState(false);
  const restoredRef = React.useRef(false);

  const reloadInitial = React.useCallback(async () => {
    setIsRetrying(true);
    setError(null);

    const result = await restoreCarsList(CARS_PAGE_SIZE);

    setIsRetrying(false);

    if ("error" in result) {
      setError(result.error ?? "Greška pri učitavanju.");
      return;
    }

    setCars(result.cars);
    setHasMore(result.hasMore);
  }, []);

  React.useEffect(() => {
    if (restoredRef.current || initialError) return;
    restoredRef.current = true;

    const shouldRestore = sessionStorage.getItem(AUTOMOBILI_RESTORE_KEY) === "true";
    if (!shouldRestore) return;

    const savedCount = Number(sessionStorage.getItem(AUTOMOBILI_COUNT_KEY) ?? "0");
    const savedScroll = Number(sessionStorage.getItem(AUTOMOBILI_SCROLL_KEY) ?? "0");

    sessionStorage.removeItem(AUTOMOBILI_RESTORE_KEY);

    const restoreScroll = () => {
      if (savedScroll > 0) {
        requestAnimationFrame(() => window.scrollTo(0, savedScroll));
      }
    };

    if (savedCount <= initialCars.length) {
      restoreScroll();
      return;
    }

    setIsRestoring(true);

    void restoreCarsList(savedCount).then((result) => {
      setIsRestoring(false);

      if ("error" in result) {
        setError(result.error ?? "Greška pri učitavanju.");
        return;
      }

      setCars(result.cars);
      setHasMore(result.hasMore);
      restoreScroll();
    });
  }, [initialCars.length, initialError]);

  async function handleLoadMore() {
    setIsLoadingMore(true);
    setError(null);

    const result = await loadMoreCars(cars.length);

    setIsLoadingMore(false);

    if ("error" in result) {
      setError(result.error ?? "Greška pri učitavanju.");
      return;
    }

    setCars((current) => [...current, ...result.cars]);
    setHasMore(result.hasMore);
  }

  if (error && cars.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card px-5 py-10 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">
          Nije moguće učitati automobile. Pokušajte ponovo.
        </p>
        <Button onClick={() => void reloadInitial()} disabled={isRetrying}>
          {isRetrying ? "Učitavanje…" : "Pokušaj ponovo"}
        </Button>
      </div>
    );
  }

  if (cars.length === 0 && !isRestoring) {
    return (
      <p className="rounded-xl border bg-card px-5 py-10 text-center text-muted-foreground shadow-sm">
        Trenutno nema automobila na prodaji.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car, index) => (
          <CarCard
            key={car.id}
            car={car}
            displayedCount={cars.length}
            priority={index < 3}
          />
        ))}
      </div>

      {isRestoring ? (
        <p className="text-center text-sm text-muted-foreground">Učitavanje…</p>
      ) : null}

      {hasMore ? (
        <div className="flex justify-center">
          <Button onClick={() => void handleLoadMore()} disabled={isLoadingMore}>
            {isLoadingMore ? "Učitavanje…" : "Učitaj još"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
