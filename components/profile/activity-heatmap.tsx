"use client";

import { HeatCalendar, HeatCalendarGrid, HeatCalendarLegend, HeatCalendarTooltip } from "@/components/charts/heat-calendar";

const WEEKS = 26;

/** `days` maps UTC dates (YYYY-MM-DD) to the number of list updates that day. */
export function ActivityHeatmap({ days, endDate }: { days: Record<string, number>; endDate: string }) {
  const end = new Date(`${endDate}T00:00:00Z`);
  // Monday of the last week, then step back to the first column.
  const monday = new Date(end);
  monday.setUTCDate(end.getUTCDate() - ((end.getUTCDay() + 6) % 7));
  const start = new Date(monday);
  start.setUTCDate(monday.getUTCDate() - (WEEKS - 1) * 7);

  const max = Math.max(4, ...Object.values(days));
  const values = Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + w * 7 + d);
      return (days[date.toISOString().slice(0, 10)] ?? 0) / max;
    }),
  );

  return (
    <div className="scrollbar-hide overflow-x-auto">
      <HeatCalendar unit="действий" weeks={WEEKS} maxCount={max} values={values} endDate={end} className="min-w-max">
        <HeatCalendarGrid>
          <HeatCalendarTooltip />
        </HeatCalendarGrid>
        <HeatCalendarLegend />
      </HeatCalendar>
    </div>
  );
}
