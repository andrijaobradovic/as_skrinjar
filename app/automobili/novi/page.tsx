import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dodaj oglas",
  description: "Dodavanje novog oglasa automobila — AS Škrinjar.",
};

export default function NoviOglasPage() {
  return (
    <section className="mx-auto flex w-[80%] min-w-0 flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Stranica u izradi
      </h1>
      <p className="max-w-md text-muted-foreground">
        Forma za dodavanje novog oglasa biće uskoro dostupna.
      </p>
      <Button asChild variant="outline">
        <Link href="/automobili">Nazad na oglase</Link>
      </Button>
    </section>
  );
}
