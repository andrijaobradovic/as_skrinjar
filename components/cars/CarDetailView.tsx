import Link from "next/link";

import { BackToCarsLink } from "@/components/cars/BackToCarsLink";
import { CarDetailAdminActions } from "@/components/cars/CarDetailAdminActions";
import { CarImageGallery } from "@/components/cars/CarImageGallery";
import { Button } from "@/components/ui/button";
import {
  buildCarTitle,
  CAR_GENERAL_INFO_FIELDS,
  CAR_MORE_INFO_FIELDS,
  formatPriceEur,
  type CarDetailField,
  type CarListItem,
  type CarRow,
} from "@/lib/cars";
import { cn } from "@/lib/utils";

function getFieldValue(car: CarRow, field: CarDetailField): string {
  if (field.format) {
    return field.format(car);
  }

  const value = car[field.key];
  if (value == null || value === "") {
    return "N/A";
  }

  return String(value);
}

function DetailField({ field, car }: { field: CarDetailField; car: CarRow }) {
  const value = getFieldValue(car, field);

  return (
    <div
      className={cn(
        "rounded-lg border bg-background/60 px-4 py-3",
        field.fullWidth && "col-span-full"
      )}
    >
      <dt className="font-medium text-foreground">{field.label}</dt>
      <dd
        className={cn(
          "mt-1 text-muted-foreground",
          field.multiline && "whitespace-pre-wrap leading-relaxed"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function DetailSection({
  title,
  fields,
  car,
}: {
  title: string;
  fields: CarDetailField[];
  car: CarRow;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {fields.map((field) => (
          <DetailField key={field.key} field={field} car={car} />
        ))}
      </dl>
    </section>
  );
}

export function CarDetailView({
  car,
  isAdmin = false,
}: {
  car: CarListItem;
  isAdmin?: boolean;
}) {
  const title = buildCarTitle(car.marka, car.model);

  return (
    <div className="space-y-6">
      {isAdmin ? <CarDetailAdminActions carId={car.id} /> : null}

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <CarImageGallery images={car.car_images} alt={title} className="rounded-none" />

        <div className="space-y-8 p-5 sm:p-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>

          <DetailSection
            title="Opšte informacije"
            fields={CAR_GENERAL_INFO_FIELDS}
            car={car}
          />

          <DetailSection
            title="Više o automobilu"
            fields={CAR_MORE_INFO_FIELDS}
            car={car}
          />
        </div>
      </div>

      <p className="text-lg font-bold text-foreground sm:text-xl">
        Cena: {formatPriceEur(car.cena_eur)}
      </p>

      <div className="flex flex-col items-start gap-4">
        <Button
          asChild
          className="h-14 px-10 text-xl font-semibold sm:h-16 sm:px-12 sm:text-2xl"
        >
          <Link href="/kontakt">Kontaktirajte nas</Link>
        </Button>

        <BackToCarsLink />
      </div>
    </div>
  );
}
