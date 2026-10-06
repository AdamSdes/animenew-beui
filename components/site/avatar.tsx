import Image from "next/image";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-sky-400 to-violet-500",
  "from-emerald-400 to-cyan-500",
  "from-amber-400 to-rose-500",
  "from-fuchsia-400 to-indigo-500",
  "from-lime-400 to-emerald-600",
  "from-orange-400 to-pink-500",
];

function hash(value: string) {
  let h = 0;
  for (const ch of value) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function Avatar({
  name,
  image,
  size = 32,
  className,
}: {
  name: string;
  image?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br font-semibold text-white",
        GRADIENTS[hash(name) % GRADIENTS.length],
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
      aria-hidden="true"
    >
      {image ? <Image src={image} alt="" fill sizes={`${size}px`} className="object-cover" unoptimized /> : initials}
    </span>
  );
}
