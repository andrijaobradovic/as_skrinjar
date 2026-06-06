import {
  CARS_PAGE_SIZE,
  isValidCarId,
  type CarListItem,
} from "@/lib/cars";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function fetchCarsPage(offset = 0, limit = CARS_PAGE_SIZE) {
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
    .range(offset, offset + limit - 1);

  const cars = (data ?? []) as CarListItem[];
  const total = count ?? 0;
  const hasMore = offset + cars.length < total;

  return { cars, total, hasMore, error: error?.message ?? null };
}

export async function fetchCarById(id: string) {
  if (!isValidCarId(id)) {
    return { car: null, error: null };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("cars")
    .select(
      `
        *,
        car_images (
          url,
          position,
          is_primary
        )
      `
    )
    .eq("id", id)
    .maybeSingle();

  return {
    car: (data as CarListItem | null) ?? null,
    error: error?.message ?? null,
  };
}
