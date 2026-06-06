"use client";

import * as React from "react";

import { ServiceCard } from "@/components/landing/ServiceCard";
import { landingServices } from "@/lib/landing-services";
import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 5000;
const SCROLL_RESUME_MS = 5000;
const MOBILE_MEDIA_QUERY = "(max-width: 639px)";

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

export function ServiceCards() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const activeIndexRef = React.useRef(0);
  const resumeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isUserScrolling, setIsUserScrolling] = React.useState(false);

  const scrollToIndex = React.useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const container = scrollRef.current;
    if (!container) return;

    const card = container.children[index] as HTMLElement | undefined;
    if (!card) return;

    const targetLeft =
      card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2;

    container.scrollTo({ left: targetLeft, behavior });
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, []);

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
    if (!container || !isMobile) return;

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
  }, [isMobile]);

  React.useEffect(() => {
    if (!isMobile || isPaused || isUserScrolling) return;

    const intervalId = window.setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % landingServices.length;
      scrollToIndex(nextIndex);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(intervalId);
  }, [isMobile, isPaused, isUserScrolling, scrollToIndex]);

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

  return (
    <section
      id="usluge"
      aria-label="Usluge AS Škrinjar"
      className="mx-auto w-[80%] pb-16 sm:pb-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:items-stretch sm:overflow-visible",
          "snap-x snap-mandatory sm:snap-none [&::-webkit-scrollbar]:hidden"
        )}
      >
        {landingServices.map((service, index) => (
          <ServiceCard
            key={service.title}
            service={service}
            priority={index === 0}
            className="w-[85%] shrink-0 snap-center sm:w-auto"
          />
        ))}
      </div>

      <div
        className="mt-4 flex justify-center gap-2 sm:hidden"
        role="tablist"
        aria-label="Navigacija usluga"
      >
        {landingServices.map((service, index) => (
          <button
            key={service.title}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Prikaži karticu: ${service.title}`}
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
    </section>
  );
}
