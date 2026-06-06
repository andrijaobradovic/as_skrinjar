"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { CARS_PAGE_SIZE, isValidCarId, type CarListItem } from "@/lib/cars";
import { createClient } from "@/utils/supabase/server";

export type CarActionResult = { error: string } | { success: true };

type AuthResult =
  | { error: string }
  | { supabase: ReturnType<typeof createClient> };

async function getAuthenticatedClient(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nemate dozvolu za ovu akciju." };
  }

  return { supabase };
}

export async function deleteCar(id: string): Promise<CarActionResult> {
  if (!isValidCarId(id)) {
    return { error: "Neispravan oglas." };
  }

  const auth = await getAuthenticatedClient();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const { supabase } = auth;
  const { error } = await supabase.from("cars").delete().eq("id", id);

  if (error) {
    return { error: "Greška pri brisanju oglasa." };
  }

  revalidatePath("/automobili");
  revalidatePath(`/automobili/${id}`);
  return { success: true };
}

export async function loadMoreCars(offset: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error, count } = await supabase
    .from("cars")
    .select(
      `
        *,
        car_images (
          url,
          position,
          is_primary
        )
      `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + CARS_PAGE_SIZE - 1);

  const cars = (data ?? []) as CarListItem[];
  const total = count ?? 0;
  const hasMore = offset + cars.length < total;

  if (error) {
    return { error: error.message ?? "Greška pri učitavanju." } as const;
  }

  return { cars, hasMore } as const;
}

export async function restoreCarsList(count: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const safeCount = Math.max(CARS_PAGE_SIZE, Math.min(count, 100));

  const { data, error, count: total } = await supabase
    .from("cars")
    .select(
      `
        *,
        car_images (
          url,
          position,
          is_primary
        )
      `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(0, safeCount - 1);

  const cars = (data ?? []) as CarListItem[];
  const totalCount = total ?? 0;
  const hasMore = cars.length < totalCount;

  if (error) {
    return { error: error.message ?? "Greška pri učitavanju." } as const;
  }

  return { cars, hasMore } as const;
}

