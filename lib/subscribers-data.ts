import {
  isSearchActive,
  sortSubscribersBySearch,
  SUBSCRIBERS_PAGE_SIZE,
  type SubscriberRow,
} from "@/lib/subscribers";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function fetchSubscribersPage(
  searchQuery = "",
  offset = 0,
  limit = SUBSCRIBERS_PAGE_SIZE
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const trimmedQuery = searchQuery.trim();

  if (!isSearchActive(trimmedQuery)) {
    const { data, error, count } = await supabase
      .from("subscribers")
      .select("id, email, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const subscribers = (data ?? []) as SubscriberRow[];
    const total = count ?? 0;

    return {
      subscribers,
      hasMore: offset + subscribers.length < total,
      error: error?.message ?? null,
    };
  }

  const { data, error } = await supabase
    .from("subscribers")
    .select("id, email, created_at")
    .ilike("email", `%${trimmedQuery}%`);

  if (error) {
    return {
      subscribers: [] as SubscriberRow[],
      hasMore: false,
      error: error.message,
    };
  }

  const sorted = sortSubscribersBySearch((data ?? []) as SubscriberRow[], trimmedQuery);
  const subscribers = sorted.slice(offset, offset + limit);

  return {
    subscribers,
    hasMore: offset + subscribers.length < sorted.length,
    error: null,
  };
}
