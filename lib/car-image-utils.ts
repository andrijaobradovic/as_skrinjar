export const CAR_IMAGES_BUCKET = "car-images";
export const MAX_CAR_IMAGES = 20;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const THUMBNAIL_SIZE = 80;
export const COMPRESS_MAX_WIDTH = 1920;
export const COMPRESS_QUALITY = 0.8;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export function isAllowedImageType(type: string): type is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

export function buildCarImageStoragePath(
  carId: string,
  fileId: string,
  extension: string
): string {
  return `${carId}/${fileId}.${extension}`;
}

export function extensionForMime(type: AllowedImageType): string {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
  }
}

export function storagePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${CAR_IMAGES_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}

export async function compressImageFile(file: File): Promise<File> {
  if (file.type === "image/webp" && file.size <= MAX_IMAGE_BYTES) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, COMPRESS_MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const outputType: AllowedImageType =
    file.type === "image/png" ? "image/png" : "image/jpeg";

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, COMPRESS_QUALITY);
  });

  if (!blob) {
    return file;
  }

  const extension = extensionForMime(outputType);
  const baseName = file.name.replace(/\.[^.]+$/, "") || "slika";

  return new File([blob], `${baseName}.${extension}`, {
    type: outputType,
    lastModified: Date.now(),
  });
}

export function validateImageFile(file: File): string | null {
  if (!isAllowedImageType(file.type)) {
    return "Dozvoljeni formati su JPEG, PNG i WEBP.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Slika ne sme biti veća od 8 MB.";
  }

  return null;
}
