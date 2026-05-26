"use client";

import { useEffect, useState } from "react";
import { UserDataContext } from "@/contexts/userContext";
import EventsDataContext from "@/contexts/EventsDataContext";
import { ThemeProvider } from "@/providers/theme-provider";
import { fetchMe, fetchEvents } from "@/lib/api";
import type { Events, User } from "@/types/eventio";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userData, setUserData] = useState<User | null>(null);
  const [events, setEvents] = useState<Events | null>(null);

  useEffect(() => {
    const server = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
    const token = localStorage.getItem("accessToken");
    if (!server || !token) return;

    Promise.all([fetchMe(), fetchEvents()])
      .then(([user, evs]) => {
        setUserData(user);
        setEvents(evs);

        // If the backend already has a complete profile for this user,
        // mark onboarding as done locally so they aren't sent back to /onboarding
        // on a new device or after clearing storage.
        const profileComplete = !!(user?.degree && user?.college);
        if (profileComplete && !localStorage.getItem("eventio-onboarded")) {
          localStorage.setItem("eventio-onboarded", "true");
        }
      })
      .catch(() => {
        // Auth errors are handled by the axios interceptor (redirects to /login).
      });
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
