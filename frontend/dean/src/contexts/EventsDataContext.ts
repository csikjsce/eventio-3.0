import { createContext } from "react";
import { Dispatch } from "react";

interface EventsDataContextInterface {
    eventsData: Events | null;
    setEventsData: Dispatch<Events> | null;
    refreshEventsData: () => void;
}

const data = {
    eventsData: null,
    setEventsData: null,
    refreshEventsData: () => {},
};

const EventsDataContext = createContext<EventsDataContextInterface>(data);

export default EventsDataContext;
