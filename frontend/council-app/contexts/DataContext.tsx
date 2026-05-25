"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { fetchMe, fetchEvents, type CouncilUser } from "@/lib/api";
import type { EventData } from "@/lib/dummy-data";

interface DataContextType {
  user: CouncilUser | null;
  events: EventData[];
  loading: boolean;
  refreshEvents: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  user: null,
  events: [],
  loading: true,
  refreshEvents: async () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CouncilUser | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshEvents = useCallback(async () => {
    try {
      const { list } = await fetchEvents();
      setEvents(list);
    } catch {
      // auth errors handled by api interceptor (redirect to /login)
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [me, { list }] = await Promise.all([fetchMe(), fetchEvents()]);
        setUser(me);
        setEvents(list);
      } catch {
        // interceptor handles 401 → logout
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DataContext.Provider value={{ user, events, loading, refreshEvents }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
