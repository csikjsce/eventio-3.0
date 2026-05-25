import type { Metadata } from "next";
import EventDetailsScreen from "@/components/screens/EventDetailsScreen";

interface EventMeta {
  id:          number;
  name:        string;
  tagline:     string | null;
  description: string | null;
  image:       string | null;
  dates:       string[];
  venue:       string | null;
  organizer:   string | null;
}

// Try internal localhost first (fastest, works when Next.js + backend share a host),
// then fall back to the public-facing domain.
const BACKEND_URLS: string[] = [
  process.env.SERVER_ADDRESS,
  "http://localhost:8000",
  process.env.NEXT_PUBLIC_SERVER_ADDRESS,
  "https://eventioapi.swdc.somaiya.edu",
].filter(Boolean) as string[];

// Deduplicate while preserving order
const BACKEND_URL_LIST = [...new Set(BACKEND_URLS)];

async function fetchEventMeta(id: string): Promise<EventMeta | null> {
  for (const base of BACKEND_URL_LIST) {
    try {
      const res = await fetch(`${base}/api/v1/event/public/${id}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(4000), // 4 s per attempt
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { error: boolean; meta?: EventMeta };
      if (data.meta) return data.meta;
    } catch {
      // try next URL
    }
  }
  console.error("[generateMetadata] all backend URLs failed for event", id);
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const meta = await fetchEventMeta(id);

  if (!meta) {
    return {
      title: "Event Details",
      description: "View event details on Eventio.",
    };
  }

  const title = meta.name;
  const baseDesc =
    meta.tagline ||
    meta.description?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    "Register for this event on Eventio.";

  const dateStr = meta.dates?.[0]
    ? new Date(meta.dates[0]).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const richDesc = [
    baseDesc,
    dateStr         ? `📅 ${dateStr}`         : null,
    meta.venue      ? `📍 ${meta.venue}`      : null,
    meta.organizer  ? `🎓 By ${meta.organizer}` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  // OG image must be an absolute URL — R2 URLs already are
  const ogImages = meta.image
    ? [{ url: meta.image, width: 1200, height: 630, alt: title }]
    : [];

  return {
    title,
    description: richDesc,
    openGraph: {
      title,
      description: richDesc,
      type:        "website",
      url:         `/event-details/${id}`,
      images:      ogImages,
      siteName:    "Eventio",
      locale:      "en_IN",
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description: richDesc,
      images:      meta.image ? [meta.image] : [],
    },
  };
}

export default function EventDetailsPage() {
  return <EventDetailsScreen />;
}
