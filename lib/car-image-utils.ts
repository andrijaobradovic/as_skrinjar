export const CAR_IMAGES_BUCKET = "car-images";
export const MAX_CAR_IMAGES = 20;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_COMPRESSED_BYTES = 200 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const OUTPUT_IMAGE_TYPE = "image/webp" as const;
export const THUMBNAIL_SIZE = 80;
export const COMPRESS_MAX_WIDTH = 1280;
export const COMPRESS_MAX_HEIGHT = 960;
export const COMPRESS_QUALITY = 0.78;
export const COMPRESS_QUALITY_STEP = 0.08;
export const COMPRESS_QUALITY_MIN = 0.5;

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

export function extensionForMime(type: AllowedImageType | typeof OUTPUT_IMAGE_TYPE): string {
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

async function canvasToWebpBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, OUTPUT_IMAGE_TYPE, quality);
  });
}

export async function compressImageFile(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    COMPRESS_MAX_WIDTH / bitmap.width,
    COMPRESS_MAX_HEIGHT / bitmap.height
  );
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

  let quality = COMPRESS_QUALITY;
  let blob: Blob | null = null;

  while (quality >= COMPRESS_QUALITY_MIN) {
    blob = await canvasToWebpBlob(canvas, quality);
    if (!blob || blob.size <= MAX_COMPRESSED_BYTES) {
      break;
    }
    quality -= COMPRESS_QUALITY_STEP;
  }

  if (!blob) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "slika";

  return new File([blob], `${baseName}.webp`, {
    type: OUTPUT_IMAGE_TYPE,
    lastModified: Date.now(),
  });
}

export function validateImageFile(file: File): string | null {
  if (!isAllowedImageType(file.type)) {
    return "Dozvoljeni formati su JPEG, PNG i WEBP.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Slika ne sme biti veća od 2 MB.";
  }

  return null;
}

export function validateCompressedImageFile(file: File): string | null {
  if (file.type !== OUTPUT_IMAGE_TYPE) {
    return "Greška pri kompresiji slike.";
  }

  if (file.size > MAX_COMPRESSED_BYTES) {
    return "Slika je i posle kompresije prevelika. Pokušajte sa manjom fotografijom.";
  }

  return null;
}
