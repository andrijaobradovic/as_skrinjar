import Image from "next/image";

import { pickCarImageUrl, type CarImageMeta } from "@/lib/cars";
import { cn } from "@/lib/utils";

export function CarImage({
  images,
  alt,
  className,
  priority = false,
}: {
  images: CarImageMeta[] | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const src = pickCarImageUrl(images);

  return (
    <div className={cn("relative aspect-[4/3] w-full overflow-hidden bg-muted", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        priority={priority}
      />
    </div>
  );
}
