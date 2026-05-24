"use client";

import { Clock, Location } from "iconsax-react";
import Link from "next/link";
import type { EventData } from "@/types/eventio";

export default function EventCard({ event }: { event: EventData }) {
  const dateLabel = event.dates[0]
    ? new Date(event.dates[0]).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBA";

  return (
    <Link
      href={`/event-details/${event.id}`}
      className="flex gap-3 items-center bg-card rounded-2xl p-3"
    >
      {/* Thumbnail */}
      <img
        src={event.logo_image__url}
        alt={event.name}
        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm font-poppins leading-tight truncate">
          {event.name}
        </p>
        <p className="text-mute text-xs mt-0.5 font-poppins">
          By {event.organizer.name}
        </p>

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <div className="flex items-center gap-1">
            <Clock size={12} color="#8a8a8a" />
            <span className="text-mute text-xs font-poppins">{dateLabel}</span>
          </div>
          {event.venue && (
            <div className="flex items-center gap-1 min-w-0">
              <Location size={12} color="#8a8a8a" className="flex-shrink-0" />
              <span className="text-mute text-xs font-poppins truncate">
                {event.venue}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Arrow */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8a8a8a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
