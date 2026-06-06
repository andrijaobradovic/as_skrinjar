import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { LandingService } from "@/lib/landing-services";
import { cn } from "@/lib/utils";

export function ServiceCard({
  service,
  className,
  priority = false,
}: {
  service: LandingService;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link href={service.href} className={cn("block", className)}>
      <Card
        className={cn(
          "group relative aspect-[8/9] gap-0 overflow-hidden rounded-xl border-2 border-transparent bg-card py-0 shadow-none ring-0",
          "transition-all duration-300 hover:border-primary"
        )}
      >
        <Image
          src={service.image}
          alt={service.alt}
          fill
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 85vw, 26vw"
        />

        <div className="absolute inset-0 bg-black/50 transition-colors duration-300 group-hover:bg-black/60 dark:bg-black/70 dark:group-hover:bg-black/80" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-4 text-center text-white sm:gap-2 sm:p-3 lg:gap-3 lg:p-6">
          <h2 className="text-xl font-semibold tracking-tight sm:text-base lg:text-2xl">
            {service.titleParts ? (
              <>
                <span className="text-primary">{service.titleParts.accent}</span>
                {service.titleParts.rest}
              </>
            ) : (
              service.title
            )}
          </h2>
          <p className="max-w-[92%] text-sm leading-snug text-white/85 sm:max-w-[90%] sm:line-clamp-6 sm:text-xs lg:line-clamp-none lg:max-w-[88%] lg:text-base lg:leading-relaxed">
            {service.description}
          </p>
        </div>
      </Card>
    </Link>
  );
}
