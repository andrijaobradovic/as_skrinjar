import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { CarForm } from "@/components/cars/CarForm";
import { buildCarTitle, isValidCarId } from "@/lib/cars";
import { carRowToFormValues } from "@/lib/car-form";
import { fetchCarById } from "@/lib/cars-data";
import { createClient } from "@/utils/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  if (!isValidCarId(id)) {
    return { title: "Izmena oglasa", robots: { index: false, follow: false } };
  }

  const { car } = await fetchCarById(id);

  return {
    title: car ? `Izmena: ${buildCarTitle(car.marka, car.model)}` : "Izmena oglasa",
    robots: { index: false, follow: false },
  };
}

export default async function IzmeniOglasPage({ params }: PageProps) {
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
    { car },
  ] = await Promise.all([
    supabase.auth.getUser(),
    fetchCarById(id),
  ]);

  if (!user) {
    redirect("/");
  }

  if (!car) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-[80%] min-w-0 flex-col px-4 py-12 sm:px-6">
      <CarForm
        mode="edit"
        carId={car.id}
        initialValues={carRowToFormValues(car)}
        initialImages={car.car_images}
      />
    </section>
  );
}
