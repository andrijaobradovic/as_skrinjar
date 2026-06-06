"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AUTOMOBILI_RESTORE_KEY } from "@/lib/cars";
import { cn } from "@/lib/utils";

export function BackToCarsLink({ className }: { className?: string }) {
  return (
    <Button asChild variant="outline" className={cn(className)}>
      <Link
        href="/automobili"
        onClick={() => {
          sessionStorage.setItem(AUTOMOBILI_RESTORE_KEY, "true");
        }}
      >
        Nazad na oglase
      </Link>
    </Button>
  );
}
