import type { Metadata } from "next";

import { FeaturedCarsSection } from "@/components/landing/FeaturedCarsSection";
import { ServiceCards } from "@/components/landing/ServiceCards";
import { WhyUsSection } from "@/components/landing/WhyUsSection";
import { buildCarTitle } from "@/lib/cars";
import { fetchLandingCars } from "@/lib/cars-data";

export async function generateMetadata(): Promise<Metadata> {
  const { cars } = await fetchLandingCars();

  if (!cars.length) {
    return {
      description:
        "AS Škrinjar — autoservis, chiptuning i prodaja automobila. Pogledajte ponudu vozila, pratite status servisa i kontaktirajte nas.",
    };
  }

  const featuredNames = cars
    .map((car) => buildCarTitle(car.marka, car.model))
    .join(", ");

  return {
    description: `AS Škrinjar — autoservis, chiptuning i prodaja automobila. Istaknuta ponuda: ${featuredNames}. Pogledajte vozila, pratite status servisa i kontaktirajte nas.`,
  };
}

export default async function Page() {
  const { cars } = await fetchLandingCars();

  return (
    <>
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 pt-12 pb-10 text-center sm:px-6">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          AS Škrinjar
        </h1>
        <p className="max-w-xl text-balance text-muted-foreground">
          Autoservis, chiptuning i prodaja automobila na jednom mestu!
        </p>
      </section>

      <ServiceCards />

      <WhyUsSection />

      <FeaturedCarsSection cars={cars} />
    </>
  );
}
