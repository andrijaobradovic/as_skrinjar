import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { NewsletterPrijavePageContent } from "@/components/newsletter/NewsletterPrijavePageContent";
import { fetchSubscribersPage } from "@/lib/subscribers-data";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Lista prijavljenih mejlova",
  description:
    "Pregledajte i upravljajte prijavljenim mejlovima za newsletter.",
  robots: { index: false, follow: false },
};

export default async function NewsletterPrijavePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { subscribers, hasMore, error } = await fetchSubscribersPage();

  if (error) {
    console.error("Failed to load subscribers:", error);
  }

  return (
    <section className="mx-auto flex w-[80%] min-w-0 flex-col items-center px-4 py-12 sm:px-6">
      <div className="mb-10 w-full min-w-0 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Lista prijavljenih mejlova
        </h1>
        <p className="mt-3 text-muted-foreground">
          Pregledajte i upravljajte prijavljenim mejlovima za newsletter.
        </p>
      </div>

      <div className="w-full min-w-0">
        <NewsletterPrijavePageContent
          initialSubscribers={subscribers}
          initialHasMore={hasMore}
        />
      </div>
    </section>
  );
}
