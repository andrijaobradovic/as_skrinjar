"use client";

import * as React from "react";
import Link from "next/link";

import { FadeIn } from "@/components/chiptuning/FadeIn";
import { ProcessStep } from "@/components/chiptuning/ProcessStep";
import { StepArrow } from "@/components/chiptuning/StepArrow";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { CHIPTUNING_STEPS } from "@/lib/chiptuning-steps";
import { cn } from "@/lib/utils";

function ProcessCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <div className="md:hidden">
      <Carousel setApi={setApi} opts={{ align: "start", loop: false }}>
        <CarouselContent className="-ml-2">
          {CHIPTUNING_STEPS.map((step, index) => (
            <CarouselItem key={step.title} className="basis-full pl-2">
              <FadeIn>
                <ProcessStep
                  step={index + 1}
                  title={step.title}
                  description={step.description}
                />
              </FadeIn>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div
        className="mt-4 flex justify-center gap-2"
        role="tablist"
        aria-label="Koraci chiptuning procesa"
      >
        {CHIPTUNING_STEPS.map((step, index) => (
          <button
            key={step.title}
            type="button"
            role="tab"
            aria-selected={current === index}
            aria-label={`Korak ${index + 1}: ${step.title}`}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "size-2.5 rounded-full transition-colors",
              current === index ? "bg-primary" : "bg-primary/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ProcessDesktop() {
  return (
    <div className="mx-auto hidden max-w-2xl flex-col md:flex">
      {CHIPTUNING_STEPS.map((step, index) => (
        <React.Fragment key={step.title}>
          <FadeIn>
            <ProcessStep
              step={index + 1}
              title={step.title}
              description={step.description}
            />
          </FadeIn>
          <StepArrow />
        </React.Fragment>
      ))}
    </div>
  );
}

export function ProcessSection() {
  return (
    <div className="space-y-8">
      <ProcessCarousel />
      <ProcessDesktop />

      <div className="hidden justify-center md:flex">
        <Button
          asChild
          className="h-14 px-10 text-xl font-semibold sm:h-16 sm:px-12 sm:text-2xl"
        >
          <Link href="/kontakt">Kontaktirajte nas</Link>
        </Button>
      </div>

      <div className="flex justify-center md:hidden">
        <Button
          asChild
          className="h-14 px-10 text-xl font-semibold sm:h-16 sm:px-12 sm:text-2xl"
        >
          <Link href="/kontakt">Kontaktirajte nas</Link>
        </Button>
      </div>
    </div>
  );
}
