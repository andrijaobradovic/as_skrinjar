"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import {
  cleanupUploadedCarImages,
  createCarRecord,
  rollbackCarCreation,
  saveCarImageRecords,
  updateCarRecord,
} from "@/app/automobili/actions";
import {
  CarFormImages,
  carImagesFromPersisted,
  type CarFormImageItem,
} from "@/components/cars/CarFormImages";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  carFormSnapshotsEqual,
  createCarFormImageSnapshots,
  createCarFormSnapshot,
  DEFAULT_CAR_FORM_VALUES,
  MIN_CAR_YEAR,
  parseCarFormData,
  validateCarFormValues,
  type CarFormFieldErrors,
  type CarFormSnapshot,
  type CarFormValues,
} from "@/lib/car-form";
import { uploadCarImageToStorage } from "@/lib/car-image-upload-client";
import {
  CAR_CHECKBOX_GROUPS,
  CAR_SELECT_FIELDS,
  CAR_UNDEFINED_VALUE,
  withUndefinedOption,
  type CarSelectField,
} from "@/lib/car-options";
import { cn } from "@/lib/utils";

type CarFormProps = {
  mode: "create" | "edit";
  carId?: string;
  initialValues?: CarFormValues;
  initialImages?: Array<{ url: string; position: number; is_primary: boolean }>;
};

type PendingNavigation =
  | { type: "href"; href: string }
  | { type: "back" };

function formatPriceInput(value: number): string {
  if (!value) return "";
  return new Intl.NumberFormat("sr-RS").format(value);
}

function parsePriceInput(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

function FormField({
  label,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

function SelectField({
  field,
  value,
  onChange,
  disabled,
  error,
}: {
  field: CarSelectField;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  const config = CAR_SELECT_FIELDS[field];

  return (
    <FormField label={config.label} htmlFor={field} error={error}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={field} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {withUndefinedOption(config.options).map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name={field} value={value} />
    </FormField>
  );
}

export function CarForm({
  mode,
  carId,
  initialValues = DEFAULT_CAR_FORM_VALUES,
  initialImages = [],
}: CarFormProps) {
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const initialSnapshotRef = React.useRef<CarFormSnapshot>(
    createCarFormSnapshot(
      initialValues,
      createCarFormImageSnapshots(carImagesFromPersisted(initialImages))
    )
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = React.useState(false);
  const [pendingNavigation, setPendingNavigation] =
    React.useState<PendingNavigation | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<CarFormFieldErrors>({});
  const [images, setImages] = React.useState<CarFormImageItem[]>(() =>
    carImagesFromPersisted(initialImages)
  );

  const [selectValues, setSelectValues] = React.useState(() => ({
    karoserija: initialValues.karoserija,
    gorivo: initialValues.gorivo,
    emisiona_klasa: initialValues.emisiona_klasa,
    pogon: initialValues.pogon,
    menjac: initialValues.menjac,
    broj_vrata: initialValues.broj_vrata,
    broj_sedista: initialValues.broj_sedista,
    strana_volana: initialValues.strana_volana,
    klima: initialValues.klima,
    materijal_enterijera: initialValues.materijal_enterijera,
    boja_enterijera: initialValues.boja_enterijera,
    registrovan: initialValues.registrovan,
    poreklo: initialValues.poreklo,
    zamena: initialValues.zamena,
  }));

  const [checkboxValues, setCheckboxValues] = React.useState({
    stanje: initialValues.stanje,
    sigurnost: initialValues.sigurnost,
    oprema: initialValues.oprema,
  });

  const [isFeatured, setIsFeatured] = React.useState(initialValues.is_featured);
  const [priceInput, setPriceInput] = React.useState(
    formatPriceInput(initialValues.cena_eur)
  );

  const currentYear = new Date().getFullYear();
  const disabled = isSubmitting;
  const submitLabel = mode === "create" ? "Postavi oglas" : "Sačuvaj izmene";
  const backHref =
    mode === "edit" && carId ? `/automobili/${carId}` : "/automobili";

  function buildFormValues(formData: FormData): CarFormValues {
    const parsed = parseCarFormData(formData);
    return {
      ...parsed,
      cena_eur: parsePriceInput(priceInput),
      is_featured: isFeatured,
      ...selectValues,
      ...checkboxValues,
    };
  }

  function getCurrentSnapshot(): CarFormSnapshot {
    const formData = formRef.current
      ? new FormData(formRef.current)
      : new FormData();
    return createCarFormSnapshot(
      buildFormValues(formData),
      createCarFormImageSnapshots(images)
    );
  }

  const hasUnsavedChanges = React.useCallback(() => {
    return !carFormSnapshotsEqual(
      initialSnapshotRef.current,
      getCurrentSnapshot()
    );
  }, [images, priceInput, isFeatured, selectValues, checkboxValues]);

  const hasUnsavedChangesRef = React.useRef(hasUnsavedChanges);
  hasUnsavedChangesRef.current = hasUnsavedChanges;

  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChangesRef.current()) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  React.useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!hasUnsavedChangesRef.current()) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      const nextUrl = new URL(href, window.location.origin);
      if (nextUrl.origin !== window.location.origin) return;
      if (nextUrl.pathname === window.location.pathname) return;

      event.preventDefault();
      event.stopPropagation();
      setPendingNavigation({ type: "href", href: `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}` });
      setLeaveDialogOpen(true);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, []);

  React.useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (!hasUnsavedChangesRef.current()) return;

      window.history.pushState(null, "", window.location.href);
      setPendingNavigation({ type: "back" });
      setLeaveDialogOpen(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function handleSelectChange(field: CarSelectField, value: string) {
    setSelectValues((current) => ({ ...current, [field]: value }));
  }

  function toggleCheckbox(
    group: keyof typeof checkboxValues,
    option: string,
    checked: boolean
  ) {
    setCheckboxValues((current) => {
      const values = new Set(current[group]);
      if (checked) {
        values.add(option);
      } else {
        values.delete(option);
      }
      return { ...current, [group]: [...values] };
    });
  }

  function requestNavigation(href: string) {
    if (hasUnsavedChanges()) {
      setPendingNavigation({ type: "href", href });
      setLeaveDialogOpen(true);
      return;
    }
    router.push(href);
  }

  function confirmLeave() {
    const navigation = pendingNavigation;
    setPendingNavigation(null);
    setLeaveDialogOpen(false);

    if (!navigation) return;

    if (navigation.type === "back") {
      router.back();
      return;
    }

    router.push(navigation.href);
  }

  async function uploadPendingImages(
    targetCarId: string,
    pendingImages: CarFormImageItem[]
  ): Promise<
    | {
        images: Array<{ url: string; position: number; is_primary: boolean }>;
        storagePaths: string[];
      }
    | { error: string; storagePaths: string[] }
  > {
    const storagePaths: string[] = [];
    const uploaded: Array<{ url: string; position: number; is_primary: boolean }> =
      [];

    let position = 0;

    for (const image of pendingImages) {
      if (image.url) {
        uploaded.push({
          url: image.url,
          position,
          is_primary: image.isPrimary,
        });
        position += 1;
        continue;
      }

      if (!image.file) {
        return {
          error: "Nedostaje fajl slike.",
          storagePaths,
        };
      }

      try {
        const result = await uploadCarImageToStorage(
          targetCarId,
          image.file,
          (progress) => {
            setImages((current) =>
              current.map((item) =>
                item.id === image.id
                  ? { ...item, uploadProgress: progress }
                  : item
              )
            );
          }
        );

        storagePaths.push(result.storagePath);
        uploaded.push({
          url: result.publicUrl,
          position,
          is_primary: image.isPrimary,
        });
        position += 1;
      } catch {
        return {
          error: "Greška pri otpremanju slika.",
          storagePaths,
        };
      }
    }

    return { images: uploaded, storagePaths };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const values = buildFormValues(formData);
    const errors = validateCarFormValues(values, images.length);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const createResult = await createCarRecord(values, images.length);
        if ("error" in createResult) {
          toast.error(createResult.error);
          return;
        }

        const uploadResult = await uploadPendingImages(
          createResult.carId,
          images
        );

        if ("error" in uploadResult) {
          await rollbackCarCreation(createResult.carId, uploadResult.storagePaths);
          toast.error(uploadResult.error);
          return;
        }

        const saveResult = await saveCarImageRecords(
          createResult.carId,
          uploadResult.images
        );

        if ("error" in saveResult) {
          await rollbackCarCreation(
            createResult.carId,
            uploadResult.storagePaths
          );
          toast.error(saveResult.error);
          return;
        }

        initialSnapshotRef.current = getCurrentSnapshot();
        toast.success("Oglas je uspešno postavljen.");
        router.push(`/automobili/${createResult.carId}`);
        router.refresh();
        return;
      }

      if (!carId) {
        toast.error("Neispravan oglas.");
        return;
      }

      const updateResult = await updateCarRecord(carId, values, images.length);
      if ("error" in updateResult) {
        toast.error(updateResult.error);
        return;
      }

      const uploadResult = await uploadPendingImages(carId, images);
      if ("error" in uploadResult) {
        await cleanupUploadedCarImages(uploadResult.storagePaths);
        toast.error(uploadResult.error);
        return;
      }

      const saveResult = await saveCarImageRecords(carId, uploadResult.images);
      if ("error" in saveResult) {
        await cleanupUploadedCarImages(uploadResult.storagePaths);
        toast.error(saveResult.error);
        return;
      }

      initialSnapshotRef.current = getCurrentSnapshot();
      toast.success("Izmene su uspešno sačuvane.");
      router.push(`/automobili/${carId}`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form
        ref={formRef}
        onSubmit={(event) => void handleSubmit(event)}
        className="flex w-full flex-col gap-8"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {mode === "create" ? "Dodaj oglas" : "Izmeni oglas"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Popunite podatke o automobilu i dodajte slike.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => requestNavigation(backHref)}
          >
            Nazad na oglase
          </Button>
        </div>

        <CarFormImages
          carId={carId}
          images={images}
          onChange={setImages}
          disabled={disabled}
          error={fieldErrors.images}
        />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Opšte informacije
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Marka"
              htmlFor="marka"
              error={fieldErrors.marka}
            >
              <Input
                id="marka"
                name="marka"
                defaultValue={initialValues.marka}
                disabled={disabled}
                required
              />
            </FormField>

            <FormField
              label="Model"
              htmlFor="model"
              error={fieldErrors.model}
            >
              <Input
                id="model"
                name="model"
                defaultValue={initialValues.model}
                disabled={disabled}
                required
              />
            </FormField>

            <FormField
              label="Cena (€)"
              htmlFor="cena_eur"
              error={fieldErrors.cena_eur}
            >
              <Input
                id="cena_eur"
                name="cena_eur"
                inputMode="numeric"
                value={priceInput}
                disabled={disabled}
                required
                onChange={(event) => {
                  setPriceInput(formatPriceInput(parsePriceInput(event.target.value)));
                }}
              />
            </FormField>

            <FormField
              label="Godište"
              htmlFor="godiste"
              error={fieldErrors.godiste}
            >
              <Input
                id="godiste"
                name="godiste"
                type="number"
                min={MIN_CAR_YEAR}
                max={currentYear}
                defaultValue={initialValues.godiste}
                disabled={disabled}
                required
              />
            </FormField>

            <SelectField
              field="karoserija"
              value={selectValues.karoserija}
              onChange={(value) => handleSelectChange("karoserija", value)}
              disabled={disabled}
            />

            <SelectField
              field="gorivo"
              value={selectValues.gorivo}
              onChange={(value) => handleSelectChange("gorivo", value)}
              disabled={disabled}
            />

            <SelectField
              field="zamena"
              value={selectValues.zamena}
              onChange={(value) => handleSelectChange("zamena", value)}
              disabled={disabled}
            />

            <FormField label="Boja" htmlFor="boja">
              <Input
                id="boja"
                name="boja"
                defaultValue={initialValues.boja}
                disabled={disabled}
              />
            </FormField>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Više o automobilu
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Kubikaža (cm³)" htmlFor="kubikaza">
              <Input
                id="kubikaza"
                name="kubikaza"
                type="number"
                min={0}
                defaultValue={initialValues.kubikaza || ""}
                disabled={disabled}
              />
            </FormField>

            <FormField label="Snaga u kW" htmlFor="snaga_kw">
              <Input
                id="snaga_kw"
                name="snaga_kw"
                type="number"
                min={0}
                defaultValue={initialValues.snaga_kw || ""}
                disabled={disabled}
              />
            </FormField>

            <FormField label="Kilometraža (km)" htmlFor="kilometraza">
              <Input
                id="kilometraza"
                name="kilometraza"
                type="number"
                min={0}
                defaultValue={initialValues.kilometraza || ""}
                disabled={disabled}
              />
            </FormField>

            <SelectField
              field="emisiona_klasa"
              value={selectValues.emisiona_klasa}
              onChange={(value) => handleSelectChange("emisiona_klasa", value)}
              disabled={disabled}
            />

            <SelectField
              field="pogon"
              value={selectValues.pogon}
              onChange={(value) => handleSelectChange("pogon", value)}
              disabled={disabled}
            />

            <SelectField
              field="menjac"
              value={selectValues.menjac}
              onChange={(value) => handleSelectChange("menjac", value)}
              disabled={disabled}
            />

            <SelectField
              field="broj_vrata"
              value={selectValues.broj_vrata}
              onChange={(value) => handleSelectChange("broj_vrata", value)}
              disabled={disabled}
            />

            <SelectField
              field="broj_sedista"
              value={selectValues.broj_sedista}
              onChange={(value) => handleSelectChange("broj_sedista", value)}
              disabled={disabled}
            />

            <SelectField
              field="strana_volana"
              value={selectValues.strana_volana}
              onChange={(value) => handleSelectChange("strana_volana", value)}
              disabled={disabled}
            />

            <SelectField
              field="klima"
              value={selectValues.klima}
              onChange={(value) => handleSelectChange("klima", value)}
              disabled={disabled}
            />

            <SelectField
              field="materijal_enterijera"
              value={selectValues.materijal_enterijera}
              onChange={(value) =>
                handleSelectChange("materijal_enterijera", value)
              }
              disabled={disabled}
            />

            <SelectField
              field="boja_enterijera"
              value={selectValues.boja_enterijera}
              onChange={(value) => handleSelectChange("boja_enterijera", value)}
              disabled={disabled}
            />

            <SelectField
              field="registrovan"
              value={selectValues.registrovan}
              onChange={(value) => handleSelectChange("registrovan", value)}
              disabled={disabled}
            />

            <SelectField
              field="poreklo"
              value={selectValues.poreklo}
              onChange={(value) => handleSelectChange("poreklo", value)}
              disabled={disabled}
            />
          </div>

          <div className="grid gap-6">
            {(Object.keys(CAR_CHECKBOX_GROUPS) as Array<keyof typeof CAR_CHECKBOX_GROUPS>).map(
              (groupKey) => {
                const group = CAR_CHECKBOX_GROUPS[groupKey];
                return (
                  <div key={groupKey} className="space-y-3">
                    <h3 className="text-base font-medium">{group.label}</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {group.options.map((option) => {
                        const checked = checkboxValues[groupKey].includes(option);
                        return (
                          <label
                            key={option}
                            className="flex items-start gap-3 rounded-lg border bg-background/60 px-3 py-2 text-sm"
                          >
                            <Checkbox
                              checked={checked}
                              disabled={disabled}
                              onCheckedChange={(value) =>
                                toggleCheckbox(groupKey, option, value === true)
                              }
                            />
                            <span>{option}</span>
                            {checked ? (
                              <input
                                type="hidden"
                                name={groupKey}
                                value={option}
                              />
                            ) : null}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
          </div>

          <FormField label="Opis" htmlFor="opis" className="col-span-full">
            <Textarea
              id="opis"
              name="opis"
              rows={6}
              defaultValue={initialValues.opis}
              disabled={disabled}
              className="min-h-32"
            />
          </FormField>
        </section>

        <div className="space-y-2 rounded-lg border bg-background/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="is_featured"
              checked={isFeatured}
              disabled={disabled}
              onCheckedChange={(value) => {
                setIsFeatured(value === true);
              }}
            />
            <Label htmlFor="is_featured" className="font-normal">
              Da li želite da se oglas prikazuje na početnoj stranici?
            </Label>
            {isFeatured ? (
              <input type="hidden" name="is_featured" value="on" />
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Maksimalno 3 istaknuta oglasa. Ako je limit dostignut, najstariji
            istaknuti oglas će biti automatski uklonjen.
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={disabled}>
            {isSubmitting ? "Čuvanje…" : submitLabel}
          </Button>
        </div>
      </form>

      <AlertDialog
        open={leaveDialogOpen}
        onOpenChange={(open) => {
          setLeaveDialogOpen(open);
          if (!open) {
            setPendingNavigation(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Napuštanje stranice</AlertDialogTitle>
            <AlertDialogDescription>
              Da li želite da napustite stranicu bez čuvanja izmena?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ne</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave}>Da</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
