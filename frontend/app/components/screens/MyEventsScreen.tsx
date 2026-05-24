"use client";

import EventCard from "@/components/EventCard";
import { getMyEvents } from "@/lib/dummy-data";

export default function MyEventsScreen() {
  const events = getMyEvents();

  return (
    <>
      <p className="mt-4 text-2xl text-foreground">My Events</p>
      <div className="mt-4">
        {events.map((event) => (
          <EventCard event={event} key={event.id} />
        ))}
      </div>
    </>
  );
}
