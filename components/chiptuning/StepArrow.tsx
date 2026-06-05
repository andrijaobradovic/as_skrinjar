"use client";

import { ChevronDownIcon } from "lucide-react";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

export function StepArrow({ className }: { className?: string }) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={cn("flex justify-center py-2", className)}
      aria-hidden
    >
      <ChevronDownIcon
        className={cn(
          "size-8 text-primary transition-opacity",
          isInView && "animate-pulse"
        )}
      />
    </div>
  );
}
