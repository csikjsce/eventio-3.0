"use client";

import { useContext } from "react";
import Link from "next/link";
import { UserDataContext } from "@/contexts/userContext";
import EventsDataContext from "@/contexts/EventsDataContext";
import EventCard from "@/components/EventCard";
import TrendingCard from "@/components/TrendingCard";
import { SearchNormal1 } from "iconsax-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import type { EventData } from "@/types/eventio";

function parentFilterOut(event: EventData) {
  return event.children.length === 0;
}
function childFilterOut(event: EventData) {
  return event.parent_id === null;
}
function ticketFilter(event: EventData) {
  return event.Participant !== false && event.Participant.ticket_collected;
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="font-semibold text-base text-foreground font-poppins">
        {title}
      </h2>
      {href ? (
        <Link
          href={href}
          className="text-primary text-xs font-poppins font-medium active:opacity-70"
        >
          View All
        </Link>
      ) : (
        <span className="text-primary text-xs font-poppins font-medium opacity-40">
          View All
        </span>
      )}
    </div>
  );
}

export default function HomeScreen() {
  const { userData } = useContext(UserDataContext);
  const { events } = useContext(EventsDataContext);
  const { isBookmarked, toggle } = useBookmarks();

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const firstName = userData?.name?.split(" ")[0] || "there";

  const trendingEvents = [
    ...(events?.TICKET_OPEN?.filter(childFilterOut) || []),
    ...(events?.ONGOING?.filter(childFilterOut) || []),
    ...(events?.REGISTRATION_OPEN?.filter(childFilterOut) || []),
    ...(events?.UPCOMING?.filter(childFilterOut) || []),
  ];

  const upcomingList = [
    ...(events?.UPCOMING?.filter(parentFilterOut) || []),
    ...(events?.REGISTRATION_OPEN?.filter(parentFilterOut) || []),
  ];

  const ticketEvents = [
    ...(events?.TICKET_CLOSED?.filter(ticketFilter) || []),
    ...(events?.ONGOING?.filter(ticketFilter) || []),
    ...(events?.TICKET_OPEN?.filter(ticketFilter) || []),
  ];

  return (
    <div className="flex flex-col gap-7 pb-36">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2.5 border border-border">
          <span className="text-foreground text-xs leading-none">▶</span>
          <span className="font-poppins text-sm font-medium text-foreground">
            KJ Somaiya
          </span>
        </div>
        <Link href="/profile">
          <img
            src={userData?.photo_url || ""}
            alt="profile"
            referrerPolicy="no-referrer"
            className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/40"
          />
        </Link>
      </div>

      {/* ── Welcome ── */}
      <div>
        <p className="text-mute text-xs font-poppins tracking-wide uppercase">
          {dateStr}
        </p>
        <h1 className="text-3xl font-bold text-foreground font-poppins mt-1 leading-tight">
          Welcome,&nbsp;{firstName}!
        </h1>
      </div>

      {/* ── Search ── */}
      <div className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3.5 border border-border">
        <SearchNormal1 size={18} color="#8a8a8a" />
        <span className="text-mute text-sm font-poppins">
          Search by location or date
        </span>
      </div>

      {/* ── Your Tickets ── */}
      {ticketEvents.length > 0 && (
        <section>
          <SectionHeader title="Your Tickets" href="/profile/myevents" />
          <div className="flex flex-col gap-3 mt-3">
            {ticketEvents.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* ── Nearby / Trending ── */}
      {trendingEvents.length > 0 && (
        <section>
          <SectionHeader title="Trending Events" href="/calendar" />
          <div className="overflow-x-auto scrollbar-hide flex gap-4 -mx-4 px-4 pb-2 mt-3">
            {trendingEvents.map((event) => {
              const text =
                event.state === "TICKET_OPEN"
                  ? "RSVP Now"
                  : event.state === "ONGOING"
                    ? "Ongoing"
                    : event.state === "REGISTRATION_OPEN"
                      ? "Register Now"
                      : "Coming Soon";
              return (
                <TrendingCard
                  key={event.id}
                  event={event}
                  text={text}
                  bookmarked={isBookmarked(event.id)}
                  onBookmark={toggle}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* ── Upcoming Events ── */}
      {upcomingList.length > 0 && (
        <section>
          <SectionHeader title="Upcoming Event" href="/calendar" />
          <div className="flex flex-col gap-3 mt-3">
            {upcomingList.slice(0, 5).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* ── Tickets Released ── */}
      {events?.REGISTRATION_OPEN?.filter(parentFilterOut).length === 0 &&
        events?.TICKET_OPEN?.filter(parentFilterOut).length !== 0 && (
          <section>
            <SectionHeader title="Tickets Released" href="/profile/myevents" />
            <div className="flex flex-col gap-3 mt-3">
              {events.TICKET_OPEN.filter(parentFilterOut).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}
    </div>
  );
}
