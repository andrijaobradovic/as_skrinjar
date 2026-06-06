import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CarDetailView } from "@/components/cars/CarDetailView";
import { buildCarTitle, isValidCarId } from "@/lib/cars";
import { fetchCarById } from "@/lib/cars-data";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  if (!isValidCarId(id)) {
    return { title: "Automobil nije pronađen" };
  }

  const { car } = await fetchCarById(id);

  if (!car) {
    return { title: "Automobil nije pronađen" };
  }

  return {
    title: buildCarTitle(car.marka, car.model),
    description: `Detalji oglasa: ${buildCarTitle(car.marka, car.model)} — AS Škrinjar.`,
  };
}

export default async function CarDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!isValidCarId(id)) {
    notFound();
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [
    {
      data: { user },
    },
    { car, error },
  ] = await Promise.all([supabase.auth.getUser(), fetchCarById(id)]);

  if (error) {
    console.error("Failed to load car:", error);
    throw new Error(error);
  }

  if (!car) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-[80%] min-w-0 flex-col px-4 py-12 sm:px-6">
      <CarDetailView car={car} isAdmin={!!user} />
    </section>
  );
}
