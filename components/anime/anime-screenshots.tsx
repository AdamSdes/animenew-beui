"use client";

import {
  ImageViewer,
  ImageViewerCaption,
  ImageViewerClose,
  ImageViewerContent,
  ImageViewerCounter,
  ImageViewerGallery,
  ImageViewerNext,
  ImageViewerPrevious,
  ImageViewerThumbnail,
} from "@/components/motion/morphing-lightbox";
import type { Screenshot } from "@/lib/shikimori/types";

export function AnimeScreenshots({ screenshots, title }: { screenshots: Screenshot[]; title: string }) {
  const images = screenshots.map((shot, i) => ({
    id: shot.id,
    src: shot.originalUrl,
    alt: `${title} — кадр ${i + 1}`,
    width: 1920,
    height: 1080,
  }));
  return (
    <ImageViewer images={images} label={`Кадры из «${title}»`}>
      <ImageViewerGallery className="grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {images.map((image) => (
          <ImageViewerThumbnail
            key={image.id}
            imageId={image.id}
            className="aspect-video rounded-xl"
            imageClassName="h-full w-full object-cover"
          />
        ))}
      </ImageViewerGallery>
      <ImageViewerContent
        header={
          <>
            <ImageViewerCounter />
            <ImageViewerClose />
          </>
        }
      >
        <ImageViewerPrevious />
        <ImageViewerCaption />
        <ImageViewerNext />
      </ImageViewerContent>
    </ImageViewer>
  );
}
