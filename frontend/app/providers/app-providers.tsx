"use client";

import { useEffect, useState } from "react";
import { UserDataContext } from "@/contexts/userContext";
import EventsDataContext from "@/contexts/EventsDataContext";
import { ThemeProvider } from "@/providers/theme-provider";
import { dummyUser, dummyEvents } from "@/lib/dummy-data";
import { fetchMe, fetchEvents, isAuthenticated } from "@/lib/api";
import type { Events, User } from "@/types/eventio";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userData, setUserData] = useState<User | null>(null);
  const [events, setEvents] = useState<Events | null>(null);

  useEffect(() => {
    async function bootstrap() {
      // Dev mode fallback: no server configured → use dummy data
      const server = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
      if (!server || !isAuthenticated()) {
        setUserData(dummyUser);
        setEvents(dummyEvents);
        return;
      }

      try {
        const [user, evs] = await Promise.all([fetchMe(), fetchEvents()]);
        setUserData(user);
        setEvents(evs);
      } catch {
        // Auth error is handled by the axios interceptor (redirect to /login).
        // For any other network error, fall back to dummy data so the UI is
        // still usable.
        setUserData(dummyUser);
        setEvents(dummyEvents);
      }
    }

    bootstrap();
  }, []);

  return (
    <ThemeProvider>
      <UserDataContext.Provider value={{ userData, setUserData }}>
        <EventsDataContext.Provider value={{ events, setEvents }}>
          {children}
        </EventsDataContext.Provider>
      </UserDataContext.Provider>
    </ThemeProvider>
  );
}
