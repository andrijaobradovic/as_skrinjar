"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { fetchSubscribersPage } from "@/lib/subscribers-data";
import {
  isDuplicateSubscriberError,
  normalizeNewsletterEmail,
} from "@/lib/subscribers";
import { validateNewsletterEmail } from "@/lib/newsletter-validation";
import { createClient } from "@/utils/supabase/server";

export type SubscriberActionResult = { error: string } | { success: true };

type AuthResult =
  | { error: string }
  | { supabase: ReturnType<typeof createClient> };

const NEWSLETTER_PRIJAVE_PATH = "/automobili/newsletter-prijave";

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

export async function loadSubscribers(searchQuery: string, offset: number) {
  const auth = await getAuthenticatedClient();
  if ("error" in auth) {
    return { error: auth.error } as const;
  }

  const result = await fetchSubscribersPage(searchQuery, offset);

  if (result.error) {
    return { error: result.error } as const;
  }

  return {
    subscribers: result.subscribers,
    hasMore: result.hasMore,
  } as const;
}

export async function addSubscriberAdmin(
  _prevState: SubscriberActionResult | null,
  formData: FormData
): Promise<SubscriberActionResult> {
  const auth = await getAuthenticatedClient();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const rawEmail = String(formData.get("email") ?? "");
  const validationError = validateNewsletterEmail(rawEmail);

  if (validationError) {
    return { error: validationError };
  }

  const email = normalizeNewsletterEmail(rawEmail);
  const { supabase } = auth;
  const { error } = await supabase.from("subscribers").insert({ email });

  if (error) {
    if (isDuplicateSubscriberError(error)) {
      return { error: "Ovaj mejl je već prijavljen." };
    }

    return { error: "Greška pri učitavanju, pokušajte ponovo." };
  }

  revalidatePath(NEWSLETTER_PRIJAVE_PATH);
  return { success: true };
}

export async function deleteSubscriber(id: string): Promise<SubscriberActionResult> {
  const auth = await getAuthenticatedClient();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const { supabase } = auth;
  const { error } = await supabase.from("subscribers").delete().eq("id", id);

  if (error) {
    return { error: "Greška pri učitavanju, pokušajte ponovo." };
  }

  revalidatePath(NEWSLETTER_PRIJAVE_PATH);
  return { success: true };
}
