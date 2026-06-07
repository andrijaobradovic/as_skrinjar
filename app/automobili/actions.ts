"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";

import {
  carFormValuesToInsert,
  parseCarFormData,
  validateCarFormValues,
  type CarFormValues,
} from "@/lib/car-form";
import { CAR_IMAGES_BUCKET, storagePathFromPublicUrl } from "@/lib/car-image-utils";
import { CARS_PAGE_SIZE, isValidCarId, type CarListItem } from "@/lib/cars";
import { LANDING_CARS_LIMIT } from "@/lib/landing-featured-cars";
import {
  checkNewsletterRateLimit,
  recordNewsletterSubmission,
} from "@/lib/newsletter-rate-limit";
import { validateNewsletterEmail } from "@/lib/newsletter-validation";
import {
  isDuplicateSubscriberError,
  normalizeNewsletterEmail,
} from "@/lib/subscribers";
import { createClient } from "@/utils/supabase/server";

export type CarActionResult = { error: string } | { success: true };
export type CreateCarResult = { error: string } | { carId: string };
export type SaveCarImagesResult = { error: string } | { success: true };
export type NewsletterSubscribeResult =
  | { success: true }
  | { error: string };

function getClientIp(headerStore: Headers): string {
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return headerStore.get("x-real-ip") ?? "unknown";
}

type AuthResult =
  | { error: string }
  | { supabase: ReturnType<typeof createClient> };

type CarImageInput = {
  url: string;
  position: number;
  is_primary: boolean;
};

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

async function removeStoragePaths(
  supabase: ReturnType<typeof createClient>,
  paths: string[]
) {
  const uniquePaths = [...new Set(paths.filter(Boolean))];
  if (!uniquePaths.length) return;

  await supabase.storage.from(CAR_IMAGES_BUCKET).remove(uniquePaths);
}

async function removeCarStorageByUrls(
  supabase: ReturnType<typeof createClient>,
  urls: string[]
) {
  const paths = urls
    .map((url) => storagePathFromPublicUrl(url))
    .filter((path): path is string => Boolean(path));

  await removeStoragePaths(supabase, paths);
}

async function enforceFeaturedLimit(
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  const { data: featured } = await supabase
    .from("cars")
    .select("id, created_at")
    .eq("is_featured", true)
    .order("created_at", { ascending: true });

  if (!featured || featured.length <= LANDING_CARS_LIMIT) {
    return;
  }

  const excessIds = featured
    .slice(0, featured.length - LANDING_CARS_LIMIT)
    .map((car) => car.id);

  if (!excessIds.length) {
    return;
  }

  await supabase
    .from("cars")
    .update({ is_featured: false })
    .in("id", excessIds);
}

export async function createCarRecord(
  values: CarFormValues,
  imageCount: number
): Promise<CreateCarResult> {
  const auth = await getAuthenticatedClient();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const errors = validateCarFormValues(values, imageCount);
  if (Object.keys(errors).length > 0) {
    const firstError = Object.values(errors)[0];
    return { error: firstError ?? "Proverite unete podatke." };
  }

  const { supabase } = auth;
  const { data, error } = await supabase
    .from("cars")
    .insert(carFormValuesToInsert(values))
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Greška pri kreiranju oglasa." };
  }

  await enforceFeaturedLimit(supabase);

  revalidatePath("/");
  revalidatePath("/automobili");
  return { carId: data.id };
}

export async function updateCarRecord(
  id: string,
  values: CarFormValues,
  imageCount: number
): Promise<CarActionResult> {
  if (!isValidCarId(id)) {
    return { error: "Neispravan oglas." };
  }

  const auth = await getAuthenticatedClient();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const errors = validateCarFormValues(values, imageCount);
  if (Object.keys(errors).length > 0) {
    const firstError = Object.values(errors)[0];
    return { error: firstError ?? "Proverite unete podatke." };
  }

  const { supabase } = auth;
  const { error } = await supabase
    .from("cars")
    .update(carFormValuesToInsert(values))
    .eq("id", id);

  if (error) {
    return { error: "Greška pri čuvanju oglasa." };
  }

  await enforceFeaturedLimit(supabase);

  revalidatePath("/");
  revalidatePath("/automobili");
  revalidatePath(`/automobili/${id}`);
  return { success: true };
}

export async function saveCarImageRecords(
  carId: string,
  images: CarImageInput[]
): Promise<SaveCarImagesResult> {
  if (!isValidCarId(carId)) {
    return { error: "Neispravan oglas." };
  }

  const auth = await getAuthenticatedClient();
  if ("error" in auth) {
    return { error: auth.error };
  }

  if (!images.length) {
    return { error: "Dodajte najmanje jednu sliku." };
  }

  const { supabase } = auth;

  const { data: existingImages, error: existingError } = await supabase
    .from("car_images")
    .select("id, url")
    .eq("car_id", carId);

  if (existingError) {
    return { error: "Greška pri učitavanju slika." };
  }

  const existingUrls = new Set((existingImages ?? []).map((image) => image.url));
  const incomingUrls = new Set(images.map((image) => image.url));
  const removedUrls = (existingImages ?? [])
    .filter((image) => !incomingUrls.has(image.url))
    .map((image) => image.url);

  const { error: deleteError } = await supabase
    .from("car_images")
    .delete()
    .eq("car_id", carId);

  if (deleteError) {
    return { error: "Greška pri ažuriranju slika." };
  }

  const newlyAddedUrls = images
    .map((image) => image.url)
    .filter((url) => !existingUrls.has(url));

  const { error: insertError } = await supabase.from("car_images").insert(
    images.map((image) => ({
      car_id: carId,
      url: image.url,
      position: image.position,
      is_primary: image.is_primary,
    }))
  );

  if (insertError) {
    await removeCarStorageByUrls(supabase, newlyAddedUrls);
    return { error: "Greška pri čuvanju slika." };
  }

  await removeCarStorageByUrls(supabase, removedUrls);

  revalidatePath("/automobili");
  revalidatePath(`/automobili/${carId}`);
  return { success: true };
}

export async function deleteCarImageImmediately(
  carId: string,
  imageUrl: string
): Promise<CarActionResult> {
  if (!isValidCarId(carId)) {
    return { error: "Neispravan oglas." };
  }

  const auth = await getAuthenticatedClient();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const { supabase } = auth;
  const { error } = await supabase
    .from("car_images")
    .delete()
    .eq("car_id", carId)
    .eq("url", imageUrl);

  if (error) {
    return { error: "Greška pri brisanju slike." };
  }

  await removeCarStorageByUrls(supabase, [imageUrl]);

  revalidatePath("/automobili");
  revalidatePath(`/automobili/${carId}`);
  return { success: true };
}

export async function cleanupUploadedCarImages(
  storagePaths: string[]
): Promise<void> {
  const auth = await getAuthenticatedClient();
  if ("error" in auth) {
    return;
  }

  await removeStoragePaths(auth.supabase, storagePaths);
}

export async function rollbackCarCreation(
  carId: string,
  storagePaths: string[]
): Promise<void> {
  if (!isValidCarId(carId)) {
    return;
  }

  const auth = await getAuthenticatedClient();
  if ("error" in auth) {
    return;
  }

  const { supabase } = auth;

  const { data: images } = await supabase
    .from("car_images")
    .select("url")
    .eq("car_id", carId);

  const imageUrls = (images ?? []).map((image) => image.url);
  await removeCarStorageByUrls(supabase, imageUrls);
  await removeStoragePaths(supabase, storagePaths);

  await supabase.from("cars").delete().eq("id", carId);
}

export async function parseAndValidateCarForm(
  formData: FormData,
  imageCount: number
): Promise<{ error: string } | { values: CarFormValues }> {
  const values = parseCarFormData(formData);
  const errors = validateCarFormValues(values, imageCount);
  const errorEntries = Object.entries(errors);

  if (errorEntries.length > 0) {
    return { error: errorEntries[0][1] };
  }

  return { values };
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

  const { data: images } = await supabase
    .from("car_images")
    .select("url")
    .eq("car_id", id);

  const { error } = await supabase.from("cars").delete().eq("id", id);

  if (error) {
    return { error: "Greška pri brisanju oglasa." };
  }

  await removeCarStorageByUrls(
    supabase,
    (images ?? []).map((image) => image.url)
  );

  revalidatePath("/");
  revalidatePath("/automobili");
  revalidatePath(`/automobili/${id}`);
  return { success: true };
}

export async function subscribeToNewsletter(
  formData: FormData
): Promise<NewsletterSubscribeResult> {
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { success: true };
  }

  const rawEmail = String(formData.get("email") ?? "");
  const validationError = validateNewsletterEmail(rawEmail);

  if (validationError) {
    return { error: validationError };
  }

  const headerStore = await headers();
  const ip = getClientIp(headerStore);

  if (!checkNewsletterRateLimit(ip)) {
    return {
      error: "Previše zahteva. Pokušajte ponovo za nekoliko minuta.",
    };
  }

  const email = normalizeNewsletterEmail(rawEmail);
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from("subscribers").insert({ email });

  if (error) {
    if (isDuplicateSubscriberError(error)) {
      return { error: "Već ste prijavljeni." };
    }

    return { error: "Greška pri učitavanju, pokušajte ponovo." };
  }

  recordNewsletterSubmission(ip);
  revalidatePath("/automobili/newsletter-prijave");
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
