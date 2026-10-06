"use client";

import { AnimatedNumber } from "@/components/motion/animated-number";

export function StatTile({ label, value, decimals = 0 }: { label: string; value: number; decimals?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-4">
      <AnimatedNumber
        value={value}
        format={(n) => n.toLocaleString("ru-RU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        className="block text-2xl font-semibold tracking-tight tabular-nums text-foreground"
      />
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
