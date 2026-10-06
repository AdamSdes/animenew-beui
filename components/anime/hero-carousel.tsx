"use client";

import Link from "next/link";
import { CylinderCarousel } from "@/components/motion/cylinder-carousel";
import { animeTitle } from "@/lib/shikimori/format";
import type { AnimeCard } from "@/lib/shikimori/types";
import { Poster } from "./poster";

export function HeroCarousel({ items }: { items: AnimeCard[] }) {
  return (
    <CylinderCarousel
      variant="convex"
      itemSize={280}
      height={340}
      visibleItems={5}
      minScale={0.6}
      autoRotate
      autoRotateSpeed={0.12}
      className="w-full"
    >
      {items.map((anime) => (
        <Link
          key={anime.id}
          href={`/anime/${anime.id}`}
          draggable={false}
          className="block h-full w-full overflow-hidden rounded-[28px] border border-border/60 shadow-2xl shadow-black/30"
        >
          <Poster
            src={anime.poster?.main2xUrl ?? anime.poster?.mainUrl}
            alt={animeTitle(anime)}
            sizes="280px"
            className="h-full w-full [&_img]:object-[center_20%]"
          />
        </Link>
      ))}
    </CylinderCarousel>
  );
}
