"use client";

import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";

import { CarImage } from "@/components/cars/CarImage";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import {
  CAR_PLACEHOLDER_IMAGE,
  sortCarImagesForGallery,
  type CarImageMeta,
} from "@/lib/cars";
import { cn } from "@/lib/utils";

export function CarImageGallery({
  images,
  alt,
  className,
}: {
  images: CarImageMeta[] | null | undefined;
  alt: string;
  className?: string;
}) {
  const sortedImages = React.useMemo(
    () => sortCarImagesForGallery(images),
    [images]
  );

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

  if (sortedImages.length <= 1) {
    return (
      <CarImage
        images={sortedImages.length === 1 ? sortedImages : images}
        alt={alt}
        priority
        className={className}
      />
    );
  }

  return (
    <div className={cn("flex w-full items-center gap-2 lg:gap-4", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className="hidden shrink-0 text-primary hover:bg-primary/10 hover:text-primary lg:inline-flex"
        onClick={() => api?.scrollPrev()}
        aria-label="Prethodna slika"
      >
        <ChevronLeftIcon className="size-8" />
      </Button>

      <div className="relative min-w-0 flex-1">
        <Carousel
          setApi={setApi}
          opts={{ loop: true, align: "start" }}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {sortedImages.map((image, index) => (
              <CarouselItem key={`${image.url}-${index}`} className="basis-full pl-0">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <Image
                    src={image.url || CAR_PLACEHOLDER_IMAGE}
                    alt={`${alt} — slika ${index + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 80vw"
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-2"
          aria-hidden="true"
        >
          {sortedImages.map((image, index) => (
            <span
              key={`${image.url}-dot-${index}`}
              className={cn(
                "size-2.5 rounded-full transition-colors",
                current === index ? "bg-primary" : "bg-muted-foreground/40"
              )}
            />
          ))}
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className="hidden shrink-0 text-primary hover:bg-primary/10 hover:text-primary lg:inline-flex"
        onClick={() => api?.scrollNext()}
        aria-label="Sledeća slika"
      >
        <ChevronRightIcon className="size-8" />
      </Button>
    </div>
  );
}
