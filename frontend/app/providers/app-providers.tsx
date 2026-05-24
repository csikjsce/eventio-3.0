"use client";

import { useState } from "react";
import { UserDataContext } from "@/contexts/userContext";
import EventsDataContext from "@/contexts/EventsDataContext";
import { ThemeProvider } from "@/providers/theme-provider";
import { dummyUser, dummyEvents } from "@/lib/dummy-data";
import type { Events, User } from "@/types/eventio";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userData, setUserData] = useState<User | null>(dummyUser);
  const [events, setEvents] = useState<Events | null>(dummyEvents);

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
