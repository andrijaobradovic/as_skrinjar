import {
  CARS_PAGE_SIZE,
  isValidCarId,
  type CarListItem,
} from "@/lib/cars";
import { LANDING_CARS_LIMIT } from "@/lib/landing-featured-cars";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const CAR_LIST_SELECT = `
  *,
  car_images (
    url,
    position,
    is_primary
  )
`;

export async function fetchCarsPage(offset = 0, limit = CARS_PAGE_SIZE) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error, count } = await supabase
    .from("cars")
    .select(CAR_LIST_SELECT, { count: "exact" })
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
    .select(CAR_LIST_SELECT)
    .eq("id", id)
    .maybeSingle();

  return {
    car: (data as CarListItem | null) ?? null,
    error: error?.message ?? null,
  };
}

export async function fetchLandingCars(limit = LANDING_CARS_LIMIT) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: featuredData, error: featuredError } = await supabase
    .from("cars")
    .select(CAR_LIST_SELECT)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (featuredError) {
    return { cars: [] as CarListItem[], error: featuredError.message };
  }

  const cars: CarListItem[] = [...((featuredData ?? []) as CarListItem[])];
  const usedIds = new Set(cars.map((car) => car.id));

  if (cars.length < limit) {
    const { data: recentData, error: recentError } = await supabase
      .from("cars")
      .select(CAR_LIST_SELECT)
      .order("created_at", { ascending: false })
      .limit(limit * 3);

    if (recentError) {
      return { cars, error: recentError.message };
    }

    for (const car of (recentData ?? []) as CarListItem[]) {
      if (cars.length >= limit) break;
      if (usedIds.has(car.id)) continue;
      cars.push(car);
      usedIds.add(car.id);
    }
  }

  return { cars, error: null };
}
