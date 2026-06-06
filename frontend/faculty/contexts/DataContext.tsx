"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { fetchMe, fetchEvents } from "@/lib/api";
import type { EventData, FacultyUser } from "@/lib/types";
import { PENDING_STATE } from "@/lib/types";

interface DataContextType {
  user:          FacultyUser | null;
  events:        EventData[];
  pendingEvents: EventData[];
  loading:       boolean;
  refresh:       () => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  user: null,
  events: [],
  pendingEvents: [],
  loading: true,
  refresh: async () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<FacultyUser | null>(null);
  const [events, setEvents]       = useState<EventData[]>([]);
  const [loading, setLoading]     = useState(true);

  const refresh = useCallback(async () => {
    const [me, list] = await Promise.all([fetchMe(), fetchEvents()]);
    setUser(me);
    setEvents(list);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [me, list] = await Promise.all([fetchMe(), fetchEvents()]);
        if (!cancelled) {
          setUser(me);
          setEvents(list);
        }
      } catch {
        // auth or network failure handled by layout redirect
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const pendingState = user?.role ? PENDING_STATE[user.role] : null;
  const pendingEvents = pendingState
    ? events.filter((e) => e.state === pendingState)
    : [];

  return (
    <DataContext.Provider value={{ user, events, pendingEvents, loading, refresh }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
