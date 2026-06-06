import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CarNotFound() {
  return (
    <section className="mx-auto flex w-[80%] min-w-0 flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Automobil nije pronađen
      </h1>
      <p className="text-muted-foreground">
        Traženi oglas ne postoji ili je uklonjen.
      </p>
      <Button asChild>
        <Link href="/automobili">Nazad na oglase</Link>
      </Button>
    </section>
  );
}
