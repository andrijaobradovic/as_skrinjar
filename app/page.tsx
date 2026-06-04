import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        AS Škrinjar
      </h1>
      <p className="max-w-xl text-balance text-muted-foreground">
        Autoservis, chiptuning i prodaja automobila. Temelj sajta je postavljen —
        stranice se dodaju u narednim fazama.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/automobili">Pogledaj automobile</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/kontakt">Kontakt</Link>
        </Button>
      </div>
    </section>
  );
}
