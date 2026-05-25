"use client";

import Link from "next/link";
import type { EventData } from "@/types/eventio";

export default function TrendingCard({
  event,
  text,
  bookmarked = false,
  onBookmark,
  registered = false,
}: {
  event: EventData;
  text: string;
  bookmarked?: boolean;
  onBookmark?: (id: number) => void;
  registered?: boolean;
}) {
  return (
    <Link
      href={
        event.children.length > 0
          ? `/child-events/${event.id}`
          : `/event-details/${event.id}`
      }
      className="w-full flex flex-col bg-card rounded-3xl overflow-hidden shadow-lg"
    >
      {/* Banner image */}
      <div className="relative">
        <img
          src={event.banner_url}
          alt={event.name}
          className="w-full h-48 object-cover"
        />

        {/* Bookmark button — separate from Link navigation */}
        <button
          onClick={(e) => {
            e.preventDefault();   // stop Link navigation
            e.stopPropagation();
            onBookmark?.(event.id);
          }}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark event"}
          className={`absolute top-3 right-3 backdrop-blur-sm rounded-full p-2 transition-colors ${
            bookmarked ? "bg-primary" : "bg-black/40"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={bookmarked ? "white" : "none"}
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
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
        {registered ? (
          <div className="w-full flex items-center justify-center gap-1.5 bg-green-500/15 border border-green-500/40 text-green-400 rounded-full py-2.5 text-xs font-semibold font-poppins text-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Registered
          </div>
        ) : (
          <div className="w-full bg-foreground text-background rounded-full py-2.5 text-xs font-semibold font-poppins text-center">
            {text}
          </div>
        )}
      </div>
    </Link>
  );
}
