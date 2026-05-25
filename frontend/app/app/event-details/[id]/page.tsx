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

async function fetchEventMeta(id: string): Promise<EventMeta | null> {
  const server = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
  if (!server) return null;
  try {
    const res = await fetch(`${server}/api/v1/event/public/${id}`, {
      next: { revalidate: 300 }, // cache for 5 min
    });
    if (!res.ok) return null;
    const data = await res.json() as { error: boolean; meta?: EventMeta };
    return data.meta ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const meta = await fetchEventMeta(id);

  if (!meta) {
    return { title: "Event Details" };
  }

  const title = meta.name;
  const description =
    meta.tagline || meta.description?.slice(0, 160) || "Register for this event on Eventio.";

  const dateStr = meta.dates?.[0]
    ? new Date(meta.dates[0]).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const fullDescription = [
    description,
    dateStr ? `📅 ${dateStr}` : null,
    meta.venue ? `📍 ${meta.venue}` : null,
    meta.organizer ? `🎓 By ${meta.organizer}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const images = meta.image ? [{ url: meta.image, width: 1200, height: 630, alt: meta.name }] : [];

  return {
    title,
    description: fullDescription,
    openGraph: {
      title,
      description: fullDescription,
      type: "website",
      url: `/event-details/${id}`,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: fullDescription,
      images: meta.image ? [meta.image] : [],
    },
  };
}

export default function EventDetailsPage() {
  return <EventDetailsScreen />;
}
