"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function AutoDismissMessage({
  message,
  onDismiss,
  className,
}: {
  message: string;
  onDismiss: () => void;
  className?: string;
}) {
  React.useEffect(() => {
    const timer = window.setTimeout(onDismiss, 10_000);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <p
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive",
        className
      )}
    >
      {message}
    </p>
  );
}
