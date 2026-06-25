import { sortCarImagesForGallery, type CarImageMeta } from "@/lib/cars";

export const SITE_URL = "https://as-skrinjar.vercel.app";
export const DEFAULT_OG_IMAGE = "/og-image.png";
export const SITE_TAGLINE =
  "Autoservis, chiptuning i prodaja automobila na jednom mestu!";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export function buildDefaultOpenGraphImages() {
  return [
    {
      url: DEFAULT_OG_IMAGE,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt: "AS Škrinjar",
    },
  ];
}

export function pickCarOgImageUrl(
  images: CarImageMeta[] | null | undefined
): string {
  const sorted = sortCarImagesForGallery(images);
  return sorted[0]?.url ?? DEFAULT_OG_IMAGE;
}
