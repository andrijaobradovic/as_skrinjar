import type { Database } from "@/utils/supabase/database.types";

export const CARS_PAGE_SIZE = 6;
export const CAR_PLACEHOLDER_IMAGE = "/car-placeholder.png";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidCarId(id: string): boolean {
  return UUID_PATTERN.test(id);
}

export type CarRow = Database["public"]["Tables"]["cars"]["Row"];
export type CarImageRow = Database["public"]["Tables"]["car_images"]["Row"];

export type CarImageMeta = Pick<CarImageRow, "url" | "position" | "is_primary">;

export type CarListItem = CarRow & {
  car_images: CarImageMeta[];
};

const numberFormatter = new Intl.NumberFormat("sr-RS");

export function formatPriceEur(value: number): string {
  return `${numberFormatter.format(value)}€`;
}

export function formatKilometraza(value: number | null | undefined): string {
  if (value == null) return "N/A";
  return `${numberFormatter.format(value)} km`;
}

export function formatKubikaza(value: number | null | undefined): string {
  if (value == null) return "N/A";
  return `${numberFormatter.format(value)} cm³`;
}

export function formatOpis(value: string | null | undefined): string {
  if (!value?.trim()) return "N/A";
  return value;
}

export function formatCarValue(value: string | number | null | undefined): string {
  if (value == null || value === "") return "N/A";
  return String(value);
}

export function formatArrayValue(values: string[] | null | undefined): string {
  if (!values?.length) return "N/A";
  return values.join(", ");
}

export function sortCarImagesForGallery(
  images: CarImageMeta[] | null | undefined
): CarImageMeta[] {
  if (!images?.length) return [];

  return [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) {
      return a.is_primary ? -1 : 1;
    }
    return a.position - b.position;
  });
}

export function pickCarImageUrl(images: CarImageMeta[] | null | undefined): string {
  const sorted = sortCarImagesForGallery(images);
  if (!sorted.length) return CAR_PLACEHOLDER_IMAGE;
  return sorted[0]?.url ?? CAR_PLACEHOLDER_IMAGE;
}

export function isExternalCarImage(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function buildCarTitle(marka: string, model: string): string {
  return `${marka} ${model}`;
}

export function buildCarCardDetails(car: Pick<CarRow, "godiste" | "kilometraza" | "gorivo">): string {
  return [
    `Godište: ${car.godiste}`,
    `Kilometraža: ${formatKilometraza(car.kilometraza)}`,
    `Gorivo: ${formatCarValue(car.gorivo)}`,
  ].join(", ");
}

export type CarDetailField = {
  key: keyof CarRow;
  label: string;
  format?: (car: CarRow) => string;
  multiline?: boolean;
  fullWidth?: boolean;
};

export const CAR_GENERAL_INFO_FIELDS: CarDetailField[] = [
  { key: "marka", label: "Marka", format: (car) => formatCarValue(car.marka) },
  { key: "model", label: "Model", format: (car) => formatCarValue(car.model) },
  { key: "godiste", label: "Godište", format: (car) => String(car.godiste) },
  { key: "karoserija", label: "Karoserija", format: (car) => formatCarValue(car.karoserija) },
  { key: "gorivo", label: "Gorivo", format: (car) => formatCarValue(car.gorivo) },
  { key: "zamena", label: "Zamena", format: (car) => formatCarValue(car.zamena) },
];

export const CAR_MORE_INFO_FIELDS: CarDetailField[] = [
  { key: "kubikaza", label: "Kubikaža", format: (car) => formatKubikaza(car.kubikaza) },
  { key: "snaga_kw", label: "Snaga u kW", format: (car) => formatCarValue(car.snaga_kw) },
  {
    key: "kilometraza",
    label: "Kilometraža",
    format: (car) => formatKilometraza(car.kilometraza),
  },
  {
    key: "emisiona_klasa",
    label: "Emisiona klasa",
    format: (car) => formatCarValue(car.emisiona_klasa),
  },
  { key: "pogon", label: "Pogon", format: (car) => formatCarValue(car.pogon) },
  { key: "menjac", label: "Menjač", format: (car) => formatCarValue(car.menjac) },
  { key: "broj_vrata", label: "Broj vrata", format: (car) => formatCarValue(car.broj_vrata) },
  { key: "broj_sedista", label: "Broj sedišta", format: (car) => formatCarValue(car.broj_sedista) },
  {
    key: "strana_volana",
    label: "Strana volana",
    format: (car) => formatCarValue(car.strana_volana),
  },
  { key: "klima", label: "Klima", format: (car) => formatCarValue(car.klima) },
  { key: "boja", label: "Boja", format: (car) => formatCarValue(car.boja) },
  {
    key: "materijal_enterijera",
    label: "Materijal enterijera",
    format: (car) => formatCarValue(car.materijal_enterijera),
  },
  {
    key: "boja_enterijera",
    label: "Boja enterijera",
    format: (car) => formatCarValue(car.boja_enterijera),
  },
  { key: "registrovan", label: "Registrovan", format: (car) => formatCarValue(car.registrovan) },
  { key: "poreklo", label: "Poreklo", format: (car) => formatCarValue(car.poreklo) },
  { key: "sigurnost", label: "Sigurnost", format: (car) => formatArrayValue(car.sigurnost) },
  { key: "oprema", label: "Oprema", format: (car) => formatArrayValue(car.oprema) },
  { key: "stanje", label: "Stanje", format: (car) => formatArrayValue(car.stanje) },
  {
    key: "opis",
    label: "Opis",
    format: (car) => formatOpis(car.opis),
    multiline: true,
    fullWidth: true,
  },
];

export const AUTOMOBILI_SCROLL_KEY = "automobili-scroll";
export const AUTOMOBILI_COUNT_KEY = "automobili-count";
export const AUTOMOBILI_RESTORE_KEY = "automobili-restore";
