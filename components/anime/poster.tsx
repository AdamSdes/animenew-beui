"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Poster image that degrades to a themed gradient with the title when missing or broken. */
export function Poster({
  src,
  alt,
  sizes = "(min-width: 1024px) 200px, 45vw",
  priority,
  compact,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  sizes?: string;
  priority?: boolean;
  /** Small thumbnails: skip the title in the placeholder. */
  compact?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const usable = src && !failed && !src.includes("missing_");
  return (
    <div className={cn("relative overflow-hidden bg-card", className)}>
      {usable ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className="object-cover"
        />
      ) : (
        <div className="poster-placeholder absolute inset-0 flex items-end p-3">
          {compact ? null : (
            <span className="line-clamp-3 text-sm font-medium leading-snug text-foreground/80">{alt}</span>
          )}
        </div>
      )}
    </div>
  );
}
