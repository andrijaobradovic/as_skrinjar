import {
  buildCarImageStoragePath,
  CAR_IMAGES_BUCKET,
  extensionForMime,
  type AllowedImageType,
} from "@/lib/car-image-utils";
import { createClient } from "@/utils/supabase/client";

export type UploadProgressHandler = (progress: number) => void;

export async function uploadCarImageToStorage(
  carId: string,
  file: File,
  onProgress?: UploadProgressHandler
): Promise<{ publicUrl: string; storagePath: string }> {
  const supabase = createClient();
  const fileId = crypto.randomUUID();
  const extension = extensionForMime(file.type as AllowedImageType);
  const storagePath = buildCarImageStoragePath(carId, fileId, extension);

  onProgress?.(10);

  const { error } = await supabase.storage
    .from(CAR_IMAGES_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error("Greška pri otpremanju slike.");
  }

  onProgress?.(100);

  const {
    data: { publicUrl },
  } = supabase.storage.from(CAR_IMAGES_BUCKET).getPublicUrl(storagePath);

  return { publicUrl, storagePath };
}
