import { CogIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function ProcessStep({
  step,
  title,
  description,
  className,
}: {
  step: number;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-lg border-2 border-primary bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-2xl hover:shadow-primary/30 hover:ring-2 hover:ring-primary/30",
        className
      )}
    >
      <div className="mb-3">
        <CogIcon className="size-8 text-primary" aria-hidden />
        <span className="sr-only">Korak {step}</span>
      </div>

      <h3 className="text-left text-2xl font-semibold text-primary dark:text-white sm:text-3xl">
        {title}
      </h3>

      <div className="mt-4 h-28 overflow-y-auto">
        <p className="text-left leading-relaxed text-neutral-900 dark:text-white">
          {description}
        </p>
      </div>
    </article>
  );
}
