"use client";

import { useMemo, useState } from "react";
import { useData } from "@/contexts/DataContext";
import EventCard from "@/components/EventCard";
import { Search } from "lucide-react";
import { STATE_BADGE } from "@/lib/types";
import { searchEvents } from "@/lib/api";
import { cn } from "@/lib/utils";

const FILTER_STATES = [
  "ALL", "APPLIED_FOR_APPROVAL", "APPLIED_FOR_PRINCI_APPROVAL",
  "UNLISTED",
  "UPCOMING", "REGISTRATION_OPEN", "ONGOING", "COMPLETED",
];

export default function EventsPage() {
  const { events, loading } = useData();
  const [filter, setFilter]   = useState("ALL");
  const [search, setSearch]   = useState("");
  const [results, setResults] = useState<typeof events | null>(null);
  const [searching, setSearching] = useState(false);

  const displayed = useMemo(() => {
    const base = results ?? events;
    if (filter === "ALL") return base;
    return base.filter((e) => e.state === filter);
  }, [events, results, filter]);

  async function handleSearch(q: string) {
    setSearch(q);
    if (!q.trim()) { setResults(null); return; }
    setSearching(true);
    try {
      setResults(await searchEvents(q.trim()));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-foreground font-marcellus text-xl sm:text-2xl mb-1">All Events</h1>
        <p className="text-muted-foreground text-sm">Browse and search events across all councils.</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by event name…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-red-500/50 transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTER_STATES.map((s) => {
          const label = s === "ALL" ? "All" : (STATE_BADGE[s]?.label ?? s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                filter === s
                  ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                  : "bg-card border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {loading || searching ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <p className="text-muted-foreground text-sm">No events match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-muted-foreground text-xs">{displayed.length} event{displayed.length !== 1 ? "s" : ""}</p>
          {displayed.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </div>
  );
}
