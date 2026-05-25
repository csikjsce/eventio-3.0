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

/**
 * Resolve the backend base URL for server-side metadata fetching.
 *
 * Priority:
 *   1. SERVER_ADDRESS      — server-only env var, never sent to the browser.
 *                            Set this in production so the Next.js server can
 *                            reach the backend even on an internal network.
 *   2. NEXT_PUBLIC_SERVER_ADDRESS — the same URL the browser uses; works fine
 *                            when Next.js and the backend are on the same host.
 */
function resolveServerAddress(): string | null {
  const addr =
    process.env.SERVER_ADDRESS ||           // server-only (preferred)
    process.env.NEXT_PUBLIC_SERVER_ADDRESS; // public fallback
  return addr && addr.trim() ? addr.trim() : null;
}

async function fetchEventMeta(id: string): Promise<EventMeta | null> {
  const server = resolveServerAddress();
  if (!server) return null;

  try {
    const res = await fetch(`${server}/api/v1/event/public/${id}`, {
      // no caching — metadata should always reflect latest event state
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { error: boolean; meta?: EventMeta };
    return data.meta ?? null;
  } catch (err) {
    console.error("[generateMetadata] fetchEventMeta failed:", err);
    return null;
  }
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
