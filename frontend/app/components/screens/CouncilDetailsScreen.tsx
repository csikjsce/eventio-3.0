"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Call,
  Send2,
  Instagram,
  Global,
  Calendar,
  Flash,
} from "iconsax-react";
import EventCard from "@/components/EventCard";
import Loader from "@/components/Loader";
import {
  getCouncilById,
  getUpcomingEventsByCouncilId,
  getPastEventsByCouncilId,
  type Council,
} from "@/lib/dummy-data";
import type { EventData } from "@/types/eventio";

type Tab = "upcoming" | "past";

export default function CouncilDetailsScreen() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [council, setCouncil] = useState<Council | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
  const [pastEvents, setPastEvents] = useState<EventData[]>([]);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const c = getCouncilById(id);
    if (c) {
      setCouncil(c);
      setUpcomingEvents(getUpcomingEventsByCouncilId(id));
      setPastEvents(getPastEventsByCouncilId(id));
    }
    setLoading(false);
  }, [id]);

  if (loading) return <Loader />;

  if (!council) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-mute font-poppins">Council not found</p>
      </div>
    );
  }

  const displayedEvents = tab === "upcoming" ? upcomingEvents : pastEvents;

  return (
    <div className="bg-background min-h-screen">
      {/* ── Hero banner ── */}
      <div className="relative w-full h-56">
        <img
          src={council.banner_url}
          alt={council.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-background" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <ArrowLeft size={20} color="white" />
        </button>
      </div>

      {/* ── Avatar floated over banner ── */}
      <div className="relative -mt-14 px-5 flex items-end gap-4 mb-4">
        <img
          src={council.photo_url}
          alt={council.name}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-background shadow-xl flex-shrink-0"
        />
        {/* Social quick-links */}
        <div className="pb-1 flex gap-2">
          {council.instagram && (
            <a
              href={`https://instagram.com/${council.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-card border border-border rounded-full flex items-center justify-center"
            >
              <Instagram size={16} color="#8a8a8a" />
            </a>
          )}
          {council.website && (
            <a
              href={council.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-card border border-border rounded-full flex items-center justify-center"
            >
              <Global size={16} color="#8a8a8a" />
            </a>
          )}
          <a
            href={`mailto:${council.email}`}
            className="w-9 h-9 bg-card border border-border rounded-full flex items-center justify-center"
          >
            <Send2 size={16} color="#8a8a8a" />
          </a>
          <a
            href={`tel:+91${council.phone_number}`}
            className="w-9 h-9 bg-card border border-border rounded-full flex items-center justify-center"
          >
            <Call size={16} color="#8a8a8a" />
          </a>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="px-5 pb-36 flex flex-col gap-5">
        {/* Name + tagline */}
        <div>
          <h1 className="font-poppins font-bold text-2xl text-foreground">
            {council.name}
          </h1>
          <p className="text-primary text-sm font-poppins mt-0.5">
            {council.tagline}
          </p>
        </div>

        {/* About */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-foreground/60 text-xs font-poppins uppercase tracking-widest mb-2">
            About
          </p>
          <p className="text-foreground text-sm font-poppins leading-relaxed">
            {council.about}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-3">
          <div className="flex-1 bg-card rounded-2xl p-4 border border-border flex flex-col items-center gap-1">
            <Calendar size={20} color="#b61f2d" />
            <span className="font-poppins font-bold text-xl text-foreground">
              {upcomingEvents.length + pastEvents.length}
            </span>
            <span className="font-poppins text-xs text-mute">Total Events</span>
          </div>
          <div className="flex-1 bg-card rounded-2xl p-4 border border-border flex flex-col items-center gap-1">
            <Flash size={20} color="#b61f2d" variant="Bold" />
            <span className="font-poppins font-bold text-xl text-foreground">
              {upcomingEvents.length}
            </span>
            <span className="font-poppins text-xs text-mute">Upcoming</span>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-2 bg-card rounded-2xl p-1 border border-border">
          {(["upcoming", "past"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-poppins font-semibold transition-all ${
                tab === t
                  ? "bg-primary text-white shadow-sm"
                  : "text-mute"
              }`}
            >
              {t === "upcoming" ? "Upcoming" : "Past Events"}
            </button>
          ))}
        </div>

        {/* ── Event list ── */}
        {displayedEvents.length > 0 ? (
          <div className="flex flex-col gap-3">
            {displayedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center gap-3 text-center">
            <Calendar size={40} color="#2e2e2e" variant="Bold" />
            <p className="font-poppins text-mute text-sm">
              {tab === "upcoming"
                ? "No upcoming events right now"
                : "No past events yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
