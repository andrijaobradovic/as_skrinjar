"use client";

import * as React from "react";
import Link from "next/link";

import { CarCard } from "@/components/cars/CarCard";
import { Button } from "@/components/ui/button";
import type { CarListItem } from "@/lib/cars";
import { LANDING_FEATURED_CARS_CONTENT } from "@/lib/landing-featured-cars";
import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 5000;
const SCROLL_RESUME_MS = 5000;
const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

function getClosestCardIndex(container: HTMLElement) {
  const cards = Array.from(container.children) as HTMLElement[];
  const containerCenter = container.scrollLeft + container.clientWidth / 2;

  let closest = 0;
  let minDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const distance = Math.abs(containerCenter - cardCenter);

    if (distance < minDistance) {
      minDistance = distance;
      closest = index;
    }
  });

  return closest;
}

export function FeaturedCarsSection({ cars }: { cars: CarListItem[] }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const activeIndexRef = React.useRef(0);
  const resumeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isUserScrolling, setIsUserScrolling] = React.useState(false);

  const scrollToIndex = React.useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const container = scrollRef.current;
      if (!container) return;

      const card = container.children[index] as HTMLElement | undefined;
      if (!card) return;

      const targetLeft =
        card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2;

      container.scrollTo({ left: targetLeft, behavior });
      activeIndexRef.current = index;
      setActiveIndex(index);
    },
    []
  );

  React.useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  React.useEffect(() => {
    const container = scrollRef.current;
    if (!container || !isMobile || cars.length <= 1) return;

    function handleScroll() {
      const closest = getClosestCardIndex(container as HTMLElement);
      activeIndexRef.current = closest;
      setActiveIndex(closest);
      setIsUserScrolling(true);

      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }

      resumeTimerRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, SCROLL_RESUME_MS);
    }

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, [isMobile, cars.length]);

  React.useEffect(() => {
    if (!isMobile || isPaused || isUserScrolling || cars.length <= 1) return;

    const intervalId = window.setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % cars.length;
      scrollToIndex(nextIndex);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(intervalId);
  }, [isMobile, isPaused, isUserScrolling, cars.length, scrollToIndex]);

  function handleDotClick(index: number) {
    scrollToIndex(index);
    setIsUserScrolling(true);

    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }

    resumeTimerRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, SCROLL_RESUME_MS);
  }

  if (cars.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="featured-cars-heading"
      className="mt-14 py-16 sm:py-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="mx-auto flex w-[80%] flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <h2
            id="featured-cars-heading"
            className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
          >
            {LANDING_FEATURED_CARS_CONTENT.title}
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            {LANDING_FEATURED_CARS_CONTENT.description}
          </p>
        </div>

        <div
          ref={scrollRef}
          className={cn(
            "flex w-full gap-5 overflow-x-auto scroll-smooth [scrollbar-width:none] md:grid md:grid-cols-2 md:items-stretch md:overflow-visible lg:grid-cols-3",
            "snap-x snap-mandatory md:snap-none [&::-webkit-scrollbar]:hidden"
          )}
        >
          {cars.map((car, index) => (
            <div
              key={car.id}
              className="h-full w-[85%] shrink-0 snap-center md:w-auto md:min-h-0"
            >
              <CarCard
                car={car}
                displayedCount={cars.length}
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {cars.length > 1 ? (
          <div
            className="flex justify-center gap-2 md:hidden"
            role="tablist"
            aria-label="Navigacija istaknutih automobila"
          >
            {cars.map((car, index) => (
              <button
                key={car.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Prikaži oglas: ${car.marka} ${car.model}`}
                onClick={() => handleDotClick(index)}
                className={cn(
                  "size-2.5 rounded-full transition-colors duration-300",
                  index === activeIndex
                    ? "bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        ) : null}

        <Button asChild size="lg">
          <Link href={LANDING_FEATURED_CARS_CONTENT.ctaHref}>
            {LANDING_FEATURED_CARS_CONTENT.ctaLabel}
          </Link>
        </Button>
      </div>
    </section>
  );
}
