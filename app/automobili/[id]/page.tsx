import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CarDetailView } from "@/components/cars/CarDetailView";
import { buildCarTitle, isValidCarId } from "@/lib/cars";
import { fetchCarById } from "@/lib/cars-data";
import {
  buildDefaultOpenGraphImages,
  DEFAULT_OG_IMAGE,
  pickCarOgImageUrl,
} from "@/lib/site-metadata";
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

  const title = buildCarTitle(car.marka, car.model);
  const description = `Detalji oglasa: ${title} — AS Škrinjar.`;
  const ogImageUrl = pickCarOgImageUrl(car.car_images);
  const ogImages =
    ogImageUrl === DEFAULT_OG_IMAGE
      ? buildDefaultOpenGraphImages()
      : [{ url: ogImageUrl, alt: title }];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
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
