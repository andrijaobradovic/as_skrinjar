import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { buildCarTitle, isValidCarId } from "@/lib/cars";
import { fetchCarById } from "@/lib/cars-data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  if (!isValidCarId(id)) {
    return { title: "Izmena oglasa" };
  }

  const { car } = await fetchCarById(id);

  return {
    title: car ? `Izmena: ${buildCarTitle(car.marka, car.model)}` : "Izmena oglasa",
  };
}

export default async function IzmeniOglasPage({ params }: PageProps) {
  const { id } = await params;

  if (!isValidCarId(id)) {
    notFound();
  }

  const { car } = await fetchCarById(id);

  if (!car) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-[80%] min-w-0 flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Stranica u izradi
      </h1>
      <p className="max-w-md text-muted-foreground">
        Forma za izmenu oglasa „{buildCarTitle(car.marka, car.model)}“ biće uskoro
        dostupna.
      </p>
      <Button asChild variant="outline">
        <Link href={`/automobili/${id}`}>Nazad na oglas</Link>
      </Button>
    </section>
  );
}
