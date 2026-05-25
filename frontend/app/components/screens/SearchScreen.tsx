"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { searchEvents, type SearchResult } from "@/lib/api";
import {
  SearchNormal1,
  ArrowLeft,
  CloseCircle,
  Clock,
  Location,
  TickCircle,
  Calendar,
} from "iconsax-react";

// ─── constants ────────────────────────────────────────────────────────────────

const RECENT_KEY = "eventio-recent-searches";
const MAX_RECENT = 8;

const QUICK_TAGS = [
  "Hackathon", "Workshop", "Cultural", "Sports", "Tech Talk",
  "Competition", "Seminar", "Fest",
];

const STATE_BADGE: Record<string, { label: string; cls: string }> = {
  REGISTRATION_OPEN: { label: "Register",  cls: "bg-emerald-500/15 text-emerald-400" },
  UPCOMING:          { label: "Upcoming",  cls: "bg-sky-500/15 text-sky-400"         },
  ONGOING:           { label: "Live",      cls: "bg-amber-500/15 text-amber-400"     },
  TICKET_OPEN:       { label: "RSVP",      cls: "bg-violet-500/15 text-violet-400"   },
  TICKET_CLOSED:     { label: "Closed",    cls: "bg-zinc-500/15 text-zinc-400"       },
  COMPLETED:         { label: "Done",      cls: "bg-zinc-500/15 text-zinc-400"       },
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(term: string) {
  const prev = loadRecent().filter((t) => t !== term);
  localStorage.setItem(RECENT_KEY, JSON.stringify([term, ...prev].slice(0, MAX_RECENT)));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ─── SearchResultCard ─────────────────────────────────────────────────────────

function SearchResultCard({ result }: { result: SearchResult }) {
  const badge = STATE_BADGE[result.state];
  const dateStr = result.dates?.[0] ? fmtDate(result.dates[0]) : null;
  const imgSrc = result.logo_image__url || result.banner_url || "";

  return (
    <Link href={`/event-details/${result.id}`}
      className="flex gap-3 items-center bg-card rounded-2xl p-3 border border-border active:scale-[0.98] transition-transform">
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-border">
        {imgSrc
          ? <img src={imgSrc} alt={result.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center bg-card">
              <Calendar size={20} color="#8a8a8a" />
            </div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-0.5">
          <p className="font-semibold text-foreground text-sm font-poppins leading-tight truncate flex-1">
            {result.name}
          </p>
          {badge && (
            <span className={`text-[10px] font-poppins px-1.5 py-0.5 rounded-md shrink-0 ${badge.cls}`}>
              {badge.label}
            </span>
          )}
        </div>
        <p className="text-mute text-xs font-poppins">By {result.organizer.name}</p>

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {dateStr && (
            <div className="flex items-center gap-1">
              <Clock size={11} color="#8a8a8a" />
              <span className="text-mute text-xs font-poppins">{dateStr}</span>
            </div>
          )}
          {result.venue && (
            <div className="flex items-center gap-1 min-w-0">
              <Location size={11} color="#8a8a8a" className="flex-shrink-0" />
              <span className="text-mute text-xs font-poppins truncate">{result.venue}</span>
            </div>
          )}
          {result.fee === 0 && (
            <div className="flex items-center gap-1">
              <TickCircle size={11} color="#4ade80" variant="Bold" />
              <span className="text-xs font-poppins text-emerald-400">Free</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── ResultSkeleton ───────────────────────────────────────────────────────────

function ResultSkeleton() {
  return (
    <div className="flex gap-3 items-center bg-card rounded-2xl p-3 border border-border animate-pulse">
      <div className="w-16 h-16 rounded-xl bg-border flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-border rounded w-3/4" />
        <div className="h-3 bg-border rounded w-1/2" />
        <div className="h-3 bg-border rounded w-1/3" />
      </div>
    </div>
  );
}

// ─── SearchScreen ─────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState<SearchResult[] | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(false);
  const [recent, setRecent]       = useState<string[]>([]);
  const [didSearch, setDidSearch] = useState(false);

  // Load recent searches on mount + autofocus
  useEffect(() => {
    setRecent(loadRecent());
    inputRef.current?.focus();
  }, []);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults(null);
      setDidSearch(false);
      return;
    }
    setLoading(true);
    setError(false);
    setDidSearch(true);
    try {
      const data = await searchEvents(trimmed);
      setResults(data);
      saveRecent(trimmed);
      setRecent(loadRecent());
    } catch {
      setError(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => doSearch(query), 350);
    return () => clearTimeout(id);
  }, [query, doSearch]);

  function clearQuery() {
    setQuery("");
    setResults(null);
    setDidSearch(false);
    inputRef.current?.focus();
  }

  function removeRecent(term: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const updated = loadRecent().filter((t) => t !== term);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    setRecent(updated);
  }

  function clearAllRecent() {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  }

  const showEmpty = results?.length === 0 && didSearch && !loading;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">

      {/* ── Sticky search header ── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm pt-4 pb-3 px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-card border border-border active:opacity-70 shrink-0">
            <ArrowLeft size={18} color="var(--foreground)" />
          </button>

          <div className="flex-1 flex items-center gap-2 bg-card rounded-2xl px-4 py-3 border border-border">
            <SearchNormal1 size={17} color="#8a8a8a" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, councils…"
              className="flex-1 bg-transparent text-sm font-poppins text-foreground placeholder:text-mute outline-none"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
            {query && (
              <button type="button" onClick={clearQuery} className="shrink-0 active:opacity-70">
                <CloseCircle size={17} color="#8a8a8a" variant="Bold" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 pt-5 space-y-6">

        {/* ── Quick category chips (always visible) ── */}
        {!didSearch && (
          <>
            <div>
              <p className="text-mute text-xs font-poppins uppercase tracking-wider mb-3">
                Browse by category
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_TAGS.map((tag) => (
                  <button key={tag} type="button"
                    onClick={() => setQuery(tag)}
                    className="px-3.5 py-1.5 rounded-full bg-card border border-border text-foreground text-xs font-poppins active:opacity-70 transition-opacity">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Recent searches ── */}
            {recent.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-mute text-xs font-poppins uppercase tracking-wider">
                    Recent
                  </p>
                  <button type="button" onClick={clearAllRecent}
                    className="text-primary text-xs font-poppins active:opacity-70">
                    Clear all
                  </button>
                </div>
                <div className="flex flex-col gap-0 divide-y divide-border">
                  {recent.map((term) => (
                    <button key={term} type="button"
                      onClick={() => setQuery(term)}
                      className="flex items-center gap-3 py-3 text-left active:opacity-70 w-full">
                      <Clock size={15} color="#8a8a8a" />
                      <span className="flex-1 text-sm font-poppins text-foreground">{term}</span>
                      <span onClick={(e) => removeRecent(term, e)}
                        className="p-1 active:opacity-70">
                        <CloseCircle size={15} color="#8a8a8a" variant="Bold" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <ResultSkeleton key={i} />)}
          </div>
        )}

        {/* ── Error state ── */}
        {error && !loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <SearchNormal1 size={40} color="#8a8a8a" />
            <p className="text-mute font-poppins text-sm text-center">
              Something went wrong. Try again.
            </p>
            <button type="button" onClick={() => doSearch(query)}
              className="text-primary text-sm font-poppins font-medium active:opacity-70">
              Retry
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {showEmpty && !error && (
          <div className="flex flex-col items-center py-16 gap-3">
            <SearchNormal1 size={40} color="#8a8a8a" />
            <p className="text-foreground font-poppins font-semibold text-base">No results</p>
            <p className="text-mute font-poppins text-sm text-center">
              No events found for &ldquo;{query.trim()}&rdquo;. Try a different keyword.
            </p>
          </div>
        )}

        {/* ── Search results ── */}
        {!loading && results && results.length > 0 && (
          <div>
            <p className="text-mute text-xs font-poppins uppercase tracking-wider mb-3">
              {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query.trim()}&rdquo;
            </p>
            <div className="flex flex-col gap-3">
              {results.map((r) => (
                <SearchResultCard key={r.id} result={r} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
