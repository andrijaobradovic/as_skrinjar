export const SERVICE_STATUS_VALUES = [
  "na_cekanju",
  "servis_u_toku",
  "servis_zavrsen",
] as const;

export type ServiceStatusValue = (typeof SERVICE_STATUS_VALUES)[number];

export const DEFAULT_SERVICE_STATUS: ServiceStatusValue = "na_cekanju";

export const SERVICE_STATUS_LABELS: Record<ServiceStatusValue, string> = {
  na_cekanju: "Na čekanju",
  servis_u_toku: "Servis u toku",
  servis_zavrsen: "Servis završen",
};

export const SERVICE_STATUS_STYLES: Record<ServiceStatusValue, string> = {
  na_cekanju:
    "bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100",
  servis_u_toku:
    "bg-amber-200 text-amber-900 dark:bg-amber-800/70 dark:text-amber-50",
  servis_zavrsen:
    "bg-emerald-200 text-emerald-900 dark:bg-emerald-800/70 dark:text-emerald-50",
};

export type ServiceStatusRow = {
  id: string;
  tablice: string;
  status: ServiceStatusValue;
  created_at: string;
  updated_at: string;
};

export function normalizeTablice(value: string): string {
  return value.trim().toLowerCase();
}

export function isServiceStatusValue(value: string): value is ServiceStatusValue {
  return SERVICE_STATUS_VALUES.includes(value as ServiceStatusValue);
}

export function sortServiceStatusRows(rows: ServiceStatusRow[]): ServiceStatusRow[] {
  const updated = rows
    .filter((row) => new Date(row.updated_at) > new Date(row.created_at))
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

  const unchanged = rows
    .filter((row) => new Date(row.updated_at) <= new Date(row.created_at))
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  return [...updated, ...unchanged];
}
