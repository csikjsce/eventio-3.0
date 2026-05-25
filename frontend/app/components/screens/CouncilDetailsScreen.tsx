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
  People,
} from "iconsax-react";
import EventCard from "@/components/EventCard";
import { CouncilDetailsSkeleton } from "@/components/Skeletons";
import { type Council } from "@/lib/dummy-data";
import { fetchCouncilProfile } from "@/lib/api";
import type { EventData } from "@/types/eventio";

type Tab = "upcoming" | "past" | "team";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  team: string;
  is_head: boolean;
  photo_url?: string;
}

interface FacultyAdvisor {
  id: number;
  name: string;
  email: string;
  dept: string;
  designation: string;
}

export default function CouncilDetailsScreen() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [council, setCouncil] = useState<Council | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
  const [pastEvents, setPastEvents] = useState<EventData[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [advisors, setAdvisors] = useState<FacultyAdvisor[]>([]);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCouncilProfile(id);
        if (data) {
          const profile = data.CouncilProfile ?? {};
          const mapped: Council = {
            ...data,
            about: profile.about ?? data.about ?? "",
            banner_url: profile.banner_url ?? data.banner_url ?? "",
            tagline: profile.tagline ?? data.tagline ?? "",
            instagram: profile.instagram ?? data.instagram,
            website: profile.website ?? data.website,
          };
          setCouncil(mapped);

          const evs: EventData[] = data.Events ?? [];
          const PAST_STATES = ["COMPLETED", "TICKET_CLOSED"];
          const UPCOMING_STATES = ["UPCOMING", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "TICKET_OPEN", "ONGOING"];
          setUpcomingEvents(evs.filter((e) => UPCOMING_STATES.includes(e.state)));
          setPastEvents(evs.filter((e) => PAST_STATES.includes(e.state)));

          // Extract team members + faculty advisors from profile
          const cp = data.CouncilProfile ?? {};
          if (Array.isArray(cp.members)) {
            setMembers(cp.members.map((m: TeamMember) => ({
              ...m,
              photo_url: m.photo_url ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name ?? "M")}&backgroundColor=b61f2d&textColor=ffffff`,
            })));
          }
          if (Array.isArray(cp.faculty_advisors)) {
            setAdvisors(cp.faculty_advisors);
          }
        }
      } catch { /* handled by interceptor */ }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <CouncilDetailsSkeleton />;

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
        <div className="flex gap-1 bg-card rounded-2xl p-1 border border-border">
          {([
            { id: "upcoming", label: "Upcoming" },
            { id: "past",     label: "Past" },
            { id: "team",     label: `Team${members.length ? ` (${members.length})` : ""}` },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-poppins font-semibold transition-all ${
                tab === t.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-mute"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Event list (upcoming / past) ── */}
        {tab !== "team" && (
          displayedEvents.length > 0 ? (
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
          )
        )}

        {/* ── Team tab ── */}
        {tab === "team" && (
          <div className="flex flex-col gap-5">

            {/* Heads & Core */}
            {members.filter(m => m.is_head).length > 0 && (
              <div>
                <p className="text-xs font-poppins font-semibold text-mute uppercase tracking-widest mb-3">
                  Heads & Core Team
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {members.filter(m => m.is_head).map(m => (
                    <div key={m.id} className="bg-card border border-border rounded-2xl p-3 flex flex-col items-center gap-2 text-center">
                      <div className="relative">
                        <img
                          src={m.photo_url}
                          alt={m.name}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/40"
                        />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white text-[8px]">★</span>
                      </div>
                      <div>
                        <p className="font-poppins font-semibold text-foreground text-xs leading-tight">{m.name}</p>
                        <p className="font-poppins text-mute text-[10px] mt-0.5">{m.role}</p>
                        <span className="inline-block mt-1 text-[9px] font-poppins bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {m.team}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All other members */}
            {members.filter(m => !m.is_head).length > 0 && (
              <div>
                <p className="text-xs font-poppins font-semibold text-mute uppercase tracking-widest mb-3">
                  Members
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {members.filter(m => !m.is_head).map(m => (
                    <div key={m.id} className="bg-card border border-border rounded-2xl p-2.5 flex flex-col items-center gap-1.5 text-center">
                      <img
                        src={m.photo_url}
                        alt={m.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-poppins font-medium text-foreground text-[10px] leading-tight line-clamp-1">{m.name}</p>
                        <p className="font-poppins text-mute text-[9px] mt-0.5 line-clamp-1">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Faculty Advisors */}
            {advisors.length > 0 && (
              <div>
                <p className="text-xs font-poppins font-semibold text-mute uppercase tracking-widest mb-3">
                  Faculty Advisors
                </p>
                <div className="flex flex-col gap-2">
                  {advisors.map(a => (
                    <div key={a.id} className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-poppins font-bold shrink-0">
                        {a.name.split(" ").filter((w: string) => /^[A-Z]/.test(w)).slice(0, 2).map((w: string) => w[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-poppins font-semibold text-foreground text-sm leading-tight">{a.name}</p>
                        <p className="font-poppins text-mute text-xs mt-0.5">{a.designation} · {a.dept}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {members.length === 0 && advisors.length === 0 && (
              <div className="py-12 flex flex-col items-center gap-3 text-center">
                <People size={40} color="#2e2e2e" variant="Bold" />
                <p className="font-poppins text-mute text-sm">Team info not available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
