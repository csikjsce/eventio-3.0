"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchCalendarEvents } from "@/lib/api";
import type { CalendarEvent } from "@/lib/types";
import { STATE_BADGE, fmtDate } from "@/lib/types";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const [events, setEvents]   = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor]   = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());

  useEffect(() => {
    fetchCalendarEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const year  = cursor.getFullYear();
  const month = cursor.getMonth();

  const grid = useMemo(() => {
    const first    = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [year, month]);

  const eventsForDay = (day: Date) =>
    events.filter((e) => e.dates?.some((d) => sameDay(new Date(d), day)));

  const selectedEvents = eventsForDay(selected);
  const monthLabel = cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-foreground font-marcellus text-xl sm:text-2xl mb-1">Calendar</h1>
        <p className="text-muted-foreground text-sm">Upcoming and live events across campus.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
            <ChevronLeft size={16} />
          </button>
          <p className="font-semibold">{monthLabel}</p>
          <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {grid.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dayEvents = eventsForDay(day);
            const isSelected = sameDay(day, selected);
            const isToday    = sameDay(day, new Date());
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelected(day)}
                className={cn(
                  "aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-all",
                  isSelected ? "bg-red-600 text-white" : "hover:bg-muted",
                  isToday && !isSelected && "ring-1 ring-red-500/50",
                )}
              >
                {day.getDate()}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((_, j) => (
                      <div key={j} className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white/80" : "bg-red-500")} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day events */}
      <div className="mt-5">
        <h2 className="text-sm font-semibold mb-3">
          {selected.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </h2>
        {loading ? (
          <div className="h-16 bg-muted rounded-xl animate-pulse" />
        ) : selectedEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm">No events on this day.</p>
        ) : (
          <div className="space-y-2">
            {selectedEvents.map((e) => {
              const badge = STATE_BADGE[e.state] ?? { label: e.state, cls: "bg-muted" };
              return (
                <Link key={e.id} href={`/event/${e.id}`}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-red-500/30 transition-all">
                  {e.banner_url && (
                    <img src={e.banner_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.organizer?.name}</p>
                  </div>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-md shrink-0", badge.cls)}>
                    {badge.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
