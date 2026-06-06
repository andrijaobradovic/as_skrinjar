import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { WHY_US_CONTENT, WHY_US_IMAGE } from "@/lib/landing-why-us";

export function WhyUsSection() {
  return (
    <section
      aria-labelledby="why-us-heading"
      className="mt-14 bg-zinc-100 py-16 sm:py-20 dark:bg-muted"
    >
      <div className="mx-auto w-[80%]">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[2fr_3fr] lg:gap-10">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg lg:aspect-auto lg:min-h-[280px] lg:h-full">
            <Image
              src={WHY_US_IMAGE.src}
              alt={WHY_US_IMAGE.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 80vw, 32vw"
            />
            <div
              className="absolute inset-0 bg-black/30 dark:bg-black/50"
              aria-hidden
            />
          </div>

          <div className="flex flex-col items-center justify-center gap-5 text-center sm:gap-6 lg:items-end lg:text-right">
            <h2
              id="why-us-heading"
              className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
            >
              {WHY_US_CONTENT.title}
            </h2>

            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base lg:ml-auto">
              {WHY_US_CONTENT.description}
            </p>

            <Button asChild size="lg" className="w-fit lg:ml-auto">
              <Link href={WHY_US_CONTENT.ctaHref}>
                {WHY_US_CONTENT.ctaLabel}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
