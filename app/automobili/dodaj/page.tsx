import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { CarForm } from "@/components/cars/CarForm";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Dodaj oglas",
  description: "Dodavanje novog oglasa automobila — AS Škrinjar.",
  robots: { index: false, follow: false },
};

export default async function DodajOglasPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <section className="mx-auto flex w-[80%] min-w-0 flex-col px-4 py-12 sm:px-6">
      <CarForm mode="create" />
    </section>
  );
}
