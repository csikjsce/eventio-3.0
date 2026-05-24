"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/EventCard";
import { getMyEvents } from "@/lib/dummy-data";
import { fetchMyEvents } from "@/lib/api";
import type { EventData } from "@/types/eventio";
import Loader from "@/components/Loader";

export default function MyEventsScreen() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const server = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
        if (server && localStorage.getItem("accessToken")) {
          const data = await fetchMyEvents();
          setEvents((data as EventData[]) ?? []);
        } else {
          setEvents(getMyEvents());
        }
      } catch {
        setEvents(getMyEvents());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="pb-36">
      <p className="mt-4 text-2xl text-foreground font-poppins font-bold">My Events</p>
      {events.length === 0 ? (
        <p className="mt-8 text-center text-mute font-poppins text-sm">
          You haven&apos;t registered for any events yet.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {events.map((event) => (
            <EventCard event={event} key={event.id} />
          ))}
        </div>
      )}
    </div>
  );
}
