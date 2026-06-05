import type { Metadata } from "next";
import { cookies } from "next/headers";

import { ServiceStatusPageContent } from "@/components/status/ServiceStatusPageContent";
import {
  isServiceStatusValue,
  sortServiceStatusRows,
  type ServiceStatusRow,
} from "@/lib/service-status";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Status servisa",
  description:
    "Pratite stanje vašeg vozila na servisu u AS Škrinjar autoservisu.",
};

export default async function StatusPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [
    {
      data: { user },
    },
    { data, error },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("service_status").select("*"),
  ]);

  const rows: ServiceStatusRow[] = (data ?? []).filter(
    (row): row is ServiceStatusRow => isServiceStatusValue(row.status)
  );

  const sortedRows = sortServiceStatusRows(rows);

  if (error) {
    console.error("Failed to load service status:", error.message);
  }

  return (
    <section className="mx-auto flex w-full flex-col items-center px-4 py-12 sm:px-6">
      <div className="mb-10 w-[70%] min-w-0 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Status servisa
        </h1>
        <p className="mt-3 text-muted-foreground">
          Pratite stanje vašeg vozila na servisu
        </p>
      </div>

      <div className="w-[70%] min-w-0">
        <ServiceStatusPageContent rows={sortedRows} isAdmin={!!user} />
      </div>
    </section>
  );
}
