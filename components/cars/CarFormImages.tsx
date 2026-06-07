"use client";

import { ImagePlusIcon, XIcon } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { deleteCarImageImmediately } from "@/app/automobili/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  compressImageFile,
  MAX_CAR_IMAGES,
  THUMBNAIL_SIZE,
  validateCompressedImageFile,
  validateImageFile,
} from "@/lib/car-image-utils";

export type CarFormImageItem = {
  id: string;
  previewUrl: string;
  file?: File;
  url?: string;
  storagePath?: string;
  isPrimary: boolean;
  uploadProgress?: number;
  persisted?: boolean;
};

type CarFormImagesProps = {
  carId?: string;
  images: CarFormImageItem[];
  onChange: (images: CarFormImageItem[]) => void;
  disabled?: boolean;
  error?: string | null;
};

function reorderImages(
  images: CarFormImageItem[],
  sourceId: string,
  targetId: string
): CarFormImageItem[] {
  const sourceIndex = images.findIndex((image) => image.id === sourceId);
  const targetIndex = images.findIndex((image) => image.id === targetId);

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    return images;
  }

  const next = [...images];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

function ensurePrimary(images: CarFormImageItem[]): CarFormImageItem[] {
  if (!images.length) return images;

  const hasPrimary = images.some((image) => image.isPrimary);
  if (hasPrimary) {
    return images;
  }

  return images.map((image, index) => ({
    ...image,
    isPrimary: index === 0,
  }));
}

function setPrimary(images: CarFormImageItem[], id: string): CarFormImageItem[] {
  return images.map((image) => ({
    ...image,
    isPrimary: image.id === id,
  }));
}

export function carImagesFromPersisted(
  images: Array<{ url: string; position: number; is_primary: boolean }>
): CarFormImageItem[] {
  return [...images]
    .sort((a, b) => a.position - b.position)
    .map((image, index) => ({
      id: `${image.url}-${index}`,
      previewUrl: image.url,
      url: image.url,
      isPrimary: image.is_primary,
      persisted: true,
    }));
}

export function CarFormImages({
  carId,
  images,
  onChange,
  disabled = false,
  error,
}: CarFormImagesProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const atLimit = images.length >= MAX_CAR_IMAGES;
  const displayError = error ?? localError;

  const updateImages = React.useCallback(
    (nextImages: CarFormImageItem[]) => {
      onChange(ensurePrimary(nextImages));
    },
    [onChange]
  );

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList?.length || disabled) return;

    setLocalError(null);
    const remainingSlots = MAX_CAR_IMAGES - images.length;
    const selectedFiles = Array.from(fileList).slice(0, remainingSlots);

    if (fileList.length > remainingSlots) {
      setLocalError(`Možete dodati najviše ${MAX_CAR_IMAGES} slika.`);
    }

    const nextImages = [...images];

    for (const originalFile of selectedFiles) {
      const validationError = validateImageFile(originalFile);
      if (validationError) {
        setLocalError(validationError);
        continue;
      }

      try {
        const file = await compressImageFile(originalFile);
        const compressedValidation = validateCompressedImageFile(file);
        if (compressedValidation) {
          setLocalError(compressedValidation);
          continue;
        }

        const previewUrl = URL.createObjectURL(file);
        nextImages.push({
          id: crypto.randomUUID(),
          previewUrl,
          file,
          isPrimary: false,
        });
      } catch {
        setLocalError("Greška pri obradi slike.");
      }
    }

    updateImages(nextImages);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleRemove(image: CarFormImageItem) {
    if (disabled) return;

    setLocalError(null);
    setDeletingId(image.id);

    try {
      if (image.persisted && carId && image.url) {
        const result = await deleteCarImageImmediately(carId, image.url);
        if ("error" in result) {
          setLocalError(result.error);
          return;
        }
      }

      if (image.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(image.previewUrl);
      }

      const filtered = images.filter((item) => item.id !== image.id);
      updateImages(filtered);
    } finally {
      setDeletingId(null);
    }
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId || disabled) return;
    updateImages(reorderImages(images, draggedId, targetId));
    setDraggedId(null);
  }

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Slike</h2>
        <p className="text-sm text-muted-foreground">
          Dodajte do {MAX_CAR_IMAGES} slika. Prevucite za promenu redosleda.
        </p>
      </div>

      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-6 text-center",
          disabled && "opacity-60"
        )}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (!atLimit) {
            void handleFilesSelected(event.dataTransfer.files);
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          disabled={disabled || atLimit}
          onChange={(event) => void handleFilesSelected(event.target.files)}
        />

        <Button
          type="button"
          variant="outline"
          disabled={disabled || atLimit}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlusIcon className="size-4" />
          Izaberite slike
        </Button>

        <p className="text-xs text-muted-foreground">
          Prevucite slike ovde ili kliknite dugme. JPEG, PNG ili WEBP do 2 MB —
          automatski se kompresuju u WebP (max 1280 px).
        </p>
      </div>

      {displayError ? (
        <p className="text-sm text-destructive" role="alert">
          {displayError}
        </p>
      ) : null}

      {images.length ? (
        <div className="grid grid-cols-2 justify-items-start gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              draggable={!disabled}
              onDragStart={() => setDraggedId(image.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(image.id)}
              className={cn(
                "relative overflow-hidden rounded-lg border bg-muted",
                draggedId === image.id && "opacity-50"
              )}
              style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
            >
              <Image
                src={image.previewUrl}
                alt="Pregled slike automobila"
                fill
                unoptimized
                className="object-cover"
                sizes={`${THUMBNAIL_SIZE}px`}
              />

              <button
                type="button"
                className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => void handleRemove(image)}
                disabled={disabled || deletingId === image.id}
                aria-label="Ukloni sliku"
              >
                <XIcon className="size-3.5" />
              </button>

              <button
                type="button"
                className="absolute bottom-1 left-1"
                onClick={() => updateImages(setPrimary(images, image.id))}
                disabled={disabled}
              >
                <Badge variant={image.isPrimary ? "default" : "outline"}>
                  {image.isPrimary ? "Primarna" : "Postavi primarnu"}
                </Badge>
              </button>

              {typeof image.uploadProgress === "number" &&
              image.uploadProgress < 100 ? (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-muted">
                  <div
                    className="h-full bg-destructive transition-all"
                    style={{ width: `${image.uploadProgress}%` }}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
