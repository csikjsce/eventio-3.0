"use client";

import { createContext } from "react";
import type { Events } from "@/types/eventio";

export interface EventsDataContextInterface {
  events: Events | null;
  setEvents: React.Dispatch<React.SetStateAction<Events | null>> | null;
}

const EventsDataContext = createContext<EventsDataContextInterface>({
  events: null,
  setEvents: null,
});

export default EventsDataContext;
