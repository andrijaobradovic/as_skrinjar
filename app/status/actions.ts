"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import {
  DEFAULT_SERVICE_STATUS,
  isServiceStatusValue,
  normalizeTablice,
  type ServiceStatusValue,
} from "@/lib/service-status";
import { createClient } from "@/utils/supabase/server";

export type StatusActionResult = { error: string } | { success: true };

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

type LookupResult =
  | { error: string }
  | { existing: { id: string; tablice: string } | undefined };

async function findExistingByTablice(
  supabase: ReturnType<typeof createClient>,
  tablice: string
): Promise<LookupResult> {
  const normalized = normalizeTablice(tablice);
  const { data, error } = await supabase
    .from("service_status")
    .select("id, tablice");

  if (error) {
    return { error: "Greška pri proveri tablica." };
  }

  const existing = data?.find(
    (row) => normalizeTablice(row.tablice) === normalized
  );

  return { existing };
}

function parseStatus(value: FormDataEntryValue | null): ServiceStatusValue {
  const status = String(value ?? "").trim();
  if (!status || !isServiceStatusValue(status)) {
    return DEFAULT_SERVICE_STATUS;
  }
  return status;
}

export async function addServiceStatus(
  _prevState: StatusActionResult | null,
  formData: FormData
): Promise<StatusActionResult> {
  const auth = await getAuthenticatedClient();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const tablice = String(formData.get("tablice") ?? "").trim();
  if (!tablice) {
    return { error: "Unesite broj tablica." };
  }

  const status = parseStatus(formData.get("status"));
  const { supabase } = auth;

  const lookup = await findExistingByTablice(supabase, tablice);
  if ("error" in lookup) {
    return { error: lookup.error };
  }

  if (lookup.existing) {
    const { error } = await supabase
      .from("service_status")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lookup.existing.id);

    if (error) {
      return { error: "Greška pri ažuriranju statusa." };
    }
  } else {
    const { error } = await supabase.from("service_status").insert({
      tablice,
      status,
    });

    if (error) {
      return { error: "Greška pri dodavanju vozila." };
    }
  }

  revalidatePath("/status");
  return { success: true };
}

export async function updateServiceStatus(
  id: string,
  status: ServiceStatusValue
): Promise<StatusActionResult> {
  const auth = await getAuthenticatedClient();
  if ("error" in auth) {
    return { error: auth.error };
  }

  if (!isServiceStatusValue(status)) {
    return { error: "Nepoznat status." };
  }

  const { supabase } = auth;
  const { error } = await supabase
    .from("service_status")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Greška pri promeni statusa." };
  }

  revalidatePath("/status");
  return { success: true };
}

export async function deleteServiceStatus(
  id: string
): Promise<StatusActionResult> {
  const auth = await getAuthenticatedClient();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const { supabase } = auth;
  const { error } = await supabase.from("service_status").delete().eq("id", id);

  if (error) {
    return { error: "Greška pri brisanju vozila." };
  }

  revalidatePath("/status");
  return { success: true };
}
