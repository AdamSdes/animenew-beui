"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";

export type AnimeTab = { value: string; label: string; count?: number; content: ReactNode };

export function AnimeTabs({ tabs }: { tabs: AnimeTab[] }) {
  if (!tabs.length) return null;
  return (
    <Tabs defaultValue={tabs[0].value} variant="underline" className="w-full">
      <div className="scrollbar-hide -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <TabsList className="min-w-max">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-3 py-2.5 text-sm">
              {tab.label}
              {tab.count ? <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">{tab.count}</span> : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="pt-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
