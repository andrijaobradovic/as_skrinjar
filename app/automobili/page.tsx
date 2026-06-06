import type { Metadata } from "next";
import { cookies } from "next/headers";

import { CarsPageContent } from "@/components/cars/CarsPageContent";
import { fetchCarsPage } from "@/lib/cars-data";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Automobili",
  description:
    "Pregledajte trenutnu ponudu automobila na prodaju u AS Škrinjar autoservisu.",
};

export default async function AutomobiliPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [
    {
      data: { user },
    },
    { cars, hasMore, error },
  ] = await Promise.all([
    supabase.auth.getUser(),
    fetchCarsPage(),
  ]);

  if (error) {
    console.error("Failed to load cars:", error);
  }

  return (
    <section className="mx-auto flex w-[80%] min-w-0 flex-col px-4 py-12 sm:px-6">
      <CarsPageContent
        initialCars={cars}
        initialHasMore={hasMore}
        initialError={error}
        isAdmin={!!user}
      />
    </section>
  );
}
