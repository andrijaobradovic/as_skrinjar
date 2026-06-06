import type { CarRow } from "@/lib/cars";
import {
  CAR_CHECKBOX_GROUPS,
  CAR_SELECT_FIELDS,
  CAR_UNDEFINED_VALUE,
  type CarSelectField,
} from "@/lib/car-options";

export const MIN_CAR_YEAR = 1950;

export type CarFormValues = {
  marka: string;
  model: string;
  cena_eur: number;
  godiste: number;
  is_featured: boolean;
  opis: string;
  boja: string;
  karoserija: string;
  gorivo: string;
  kubikaza: number;
  snaga_kw: number;
  kilometraza: number;
  emisiona_klasa: string;
  pogon: string;
  menjac: string;
  broj_vrata: string;
  broj_sedista: string;
  strana_volana: string;
  klima: string;
  materijal_enterijera: string;
  boja_enterijera: string;
  registrovan: string;
  poreklo: string;
  zamena: string;
  stanje: string[];
  sigurnost: string[];
  oprema: string[];
};

export type CarFormFieldErrors = Partial<Record<keyof CarFormValues | "images", string>>;

export const DEFAULT_CAR_FORM_VALUES: CarFormValues = {
  marka: "",
  model: "",
  cena_eur: 0,
  godiste: new Date().getFullYear(),
  is_featured: false,
  opis: "",
  boja: "",
  karoserija: CAR_UNDEFINED_VALUE,
  gorivo: CAR_UNDEFINED_VALUE,
  kubikaza: 0,
  snaga_kw: 0,
  kilometraza: 0,
  emisiona_klasa: CAR_UNDEFINED_VALUE,
  pogon: CAR_UNDEFINED_VALUE,
  menjac: CAR_UNDEFINED_VALUE,
  broj_vrata: CAR_UNDEFINED_VALUE,
  broj_sedista: CAR_UNDEFINED_VALUE,
  strana_volana: CAR_UNDEFINED_VALUE,
  klima: CAR_UNDEFINED_VALUE,
  materijal_enterijera: CAR_UNDEFINED_VALUE,
  boja_enterijera: CAR_UNDEFINED_VALUE,
  registrovan: CAR_UNDEFINED_VALUE,
  poreklo: CAR_UNDEFINED_VALUE,
  zamena: CAR_UNDEFINED_VALUE,
  stanje: [],
  sigurnost: [],
  oprema: [],
};

function parseOptionalNumber(value: FormDataEntryValue | null, fallback = 0): number {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : fallback;
}

function parseSelectValue(
  value: FormDataEntryValue | null,
  field: CarSelectField
): string {
  const raw = String(value ?? CAR_UNDEFINED_VALUE).trim() || CAR_UNDEFINED_VALUE;
  const allowed = new Set([
    CAR_UNDEFINED_VALUE,
    ...CAR_SELECT_FIELDS[field].options,
  ]);
  return allowed.has(raw) ? raw : CAR_UNDEFINED_VALUE;
}

function parseCheckboxGroup(
  formData: FormData,
  name: keyof typeof CAR_CHECKBOX_GROUPS
): string[] {
  const allowed = new Set<string>(CAR_CHECKBOX_GROUPS[name].options);
  return formData
    .getAll(name)
    .map((value) => String(value))
    .filter((value) => allowed.has(value));
}

export function carRowToFormValues(car: CarRow): CarFormValues {
  const selectValue = (value: string | null | undefined) => value ?? CAR_UNDEFINED_VALUE;

  return {
    marka: car.marka,
    model: car.model,
    cena_eur: car.cena_eur,
    godiste: car.godiste,
    is_featured: car.is_featured,
    opis: car.opis ?? "",
    boja: car.boja ?? "",
    karoserija: selectValue(car.karoserija),
    gorivo: selectValue(car.gorivo),
    kubikaza: car.kubikaza ?? 0,
    snaga_kw: car.snaga_kw ?? 0,
    kilometraza: car.kilometraza ?? 0,
    emisiona_klasa: selectValue(car.emisiona_klasa),
    pogon: selectValue(car.pogon),
    menjac: selectValue(car.menjac),
    broj_vrata: selectValue(car.broj_vrata),
    broj_sedista:
      car.broj_sedista != null ? String(car.broj_sedista) : CAR_UNDEFINED_VALUE,
    strana_volana: selectValue(car.strana_volana),
    klima: selectValue(car.klima),
    materijal_enterijera: selectValue(car.materijal_enterijera),
    boja_enterijera: selectValue(car.boja_enterijera),
    registrovan: selectValue(car.registrovan),
    poreklo: selectValue(car.poreklo),
    zamena: selectValue(car.zamena),
    stanje: car.stanje ?? [],
    sigurnost: car.sigurnost ?? [],
    oprema: car.oprema ?? [],
  };
}

export function parseCarFormData(formData: FormData): CarFormValues {
  return {
    marka: String(formData.get("marka") ?? "").trim(),
    model: String(formData.get("model") ?? "").trim(),
    cena_eur: parseOptionalNumber(formData.get("cena_eur")),
    godiste: parseOptionalNumber(
      formData.get("godiste"),
      new Date().getFullYear()
    ),
    is_featured: formData.get("is_featured") === "on",
    opis: String(formData.get("opis") ?? "").trim(),
    boja: String(formData.get("boja") ?? "").trim(),
    karoserija: parseSelectValue(formData.get("karoserija"), "karoserija"),
    gorivo: parseSelectValue(formData.get("gorivo"), "gorivo"),
    kubikaza: parseOptionalNumber(formData.get("kubikaza")),
    snaga_kw: parseOptionalNumber(formData.get("snaga_kw")),
    kilometraza: parseOptionalNumber(formData.get("kilometraza")),
    emisiona_klasa: parseSelectValue(formData.get("emisiona_klasa"), "emisiona_klasa"),
    pogon: parseSelectValue(formData.get("pogon"), "pogon"),
    menjac: parseSelectValue(formData.get("menjac"), "menjac"),
    broj_vrata: parseSelectValue(formData.get("broj_vrata"), "broj_vrata"),
    broj_sedista: parseSelectValue(formData.get("broj_sedista"), "broj_sedista"),
    strana_volana: parseSelectValue(formData.get("strana_volana"), "strana_volana"),
    klima: parseSelectValue(formData.get("klima"), "klima"),
    materijal_enterijera: parseSelectValue(
      formData.get("materijal_enterijera"),
      "materijal_enterijera"
    ),
    boja_enterijera: parseSelectValue(
      formData.get("boja_enterijera"),
      "boja_enterijera"
    ),
    registrovan: parseSelectValue(formData.get("registrovan"), "registrovan"),
    poreklo: parseSelectValue(formData.get("poreklo"), "poreklo"),
    zamena: parseSelectValue(formData.get("zamena"), "zamena"),
    stanje: parseCheckboxGroup(formData, "stanje"),
    sigurnost: parseCheckboxGroup(formData, "sigurnost"),
    oprema: parseCheckboxGroup(formData, "oprema"),
  };
}

export function validateCarFormValues(
  values: CarFormValues,
  imageCount: number
): CarFormFieldErrors {
  const errors: CarFormFieldErrors = {};
  const currentYear = new Date().getFullYear();

  if (!values.marka) {
    errors.marka = "Unesite marku.";
  }

  if (!values.model) {
    errors.model = "Unesite model.";
  }

  if (!Number.isFinite(values.cena_eur) || values.cena_eur < 1) {
    errors.cena_eur = "Cena mora biti najmanje 1 €.";
  }

  if (
    !Number.isFinite(values.godiste) ||
    values.godiste < MIN_CAR_YEAR ||
    values.godiste > currentYear
  ) {
    errors.godiste = `Unesite validnu godinu proizvodnje (${MIN_CAR_YEAR}–${currentYear}).`;
  }

  if (imageCount < 1) {
    errors.images = "Dodajte najmanje jednu sliku.";
  }

  return errors;
}

export type CarFormImageSnapshot = {
  key: string;
  isPrimary: boolean;
  position: number;
};

export type CarFormSnapshot = {
  values: CarFormValues;
  images: CarFormImageSnapshot[];
};

function sortStringArray(values: string[]): string[] {
  return [...values].sort();
}

export function normalizeCarFormValues(values: CarFormValues): CarFormValues {
  return {
    ...values,
    stanje: sortStringArray(values.stanje),
    sigurnost: sortStringArray(values.sigurnost),
    oprema: sortStringArray(values.oprema),
  };
}

export function createCarFormImageSnapshots(
  images: Array<{ id: string; url?: string; isPrimary: boolean }>
): CarFormImageSnapshot[] {
  return images.map((image, index) => ({
    key: image.url ?? `local:${image.id}`,
    isPrimary: image.isPrimary,
    position: index,
  }));
}

export function createCarFormSnapshot(
  values: CarFormValues,
  images: CarFormImageSnapshot[]
): CarFormSnapshot {
  return {
    values: normalizeCarFormValues(values),
    images,
  };
}

export function carFormSnapshotsEqual(
  left: CarFormSnapshot,
  right: CarFormSnapshot
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function carFormValuesToInsert(values: CarFormValues) {
  const brojSedista =
    values.broj_sedista === CAR_UNDEFINED_VALUE
      ? null
      : Number(values.broj_sedista);

  return {
    marka: values.marka,
    model: values.model,
    cena_eur: values.cena_eur,
    godiste: values.godiste,
    is_featured: values.is_featured,
    opis: values.opis || null,
    boja: values.boja || null,
    karoserija: values.karoserija,
    gorivo: values.gorivo,
    kubikaza: values.kubikaza,
    snaga_kw: values.snaga_kw,
    kilometraza: values.kilometraza,
    emisiona_klasa: values.emisiona_klasa,
    pogon: values.pogon,
    menjac: values.menjac,
    broj_vrata: values.broj_vrata,
    broj_sedista: brojSedista,
    strana_volana: values.strana_volana,
    klima: values.klima,
    materijal_enterijera: values.materijal_enterijera,
    boja_enterijera: values.boja_enterijera,
    registrovan: values.registrovan,
    poreklo: values.poreklo,
    zamena: values.zamena,
    stanje: values.stanje,
    sigurnost: values.sigurnost,
    oprema: values.oprema,
  };
}
