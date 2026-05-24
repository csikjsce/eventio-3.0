"use client";

import Link from "next/link";
import type { EventData } from "@/types/eventio";

export default function TrendingCard({
  event,
  text,
}: {
  event: EventData;
  text: string;
}) {
  return (
    <Link
      href={
        event.children.length > 0
          ? `/child-events/${event.id}`
          : `/event-details/${event.id}`
      }
      className="min-w-[72vw] max-w-xs flex-shrink-0 flex flex-col bg-card rounded-3xl overflow-hidden shadow-lg"
    >
      {/* Banner image */}
      <div className="relative">
        <img
          src={event.banner_url}
          alt={event.name}
          className="w-full h-44 object-cover"
        />
        {/* Bookmark pill */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full p-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="font-semibold text-foreground font-poppins text-sm leading-snug">
            {event.name}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <img
              src={event.organizer.photo_url}
              alt={event.organizer.name}
              referrerPolicy="no-referrer"
              className="w-4 h-4 rounded-full object-cover"
            />
            <p className="text-mute text-xs font-poppins">
              By {event.organizer.name}
            </p>
          </div>
        </div>
        {/* CTA */}
        <button className="w-full bg-foreground text-background rounded-full py-2.5 text-xs font-semibold font-poppins hover:opacity-90 transition-opacity">
          {text}
        </button>
      </div>
    </Link>
  );
}
