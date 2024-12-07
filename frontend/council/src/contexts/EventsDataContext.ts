import { createContext } from 'react';
import { Dispatch } from 'react';

interface EventsDataContextInterface {
  eventsData: Events | null;
  setEventsData: Dispatch<Events> | null;
  eventsList: EventData[];
  refreshEventsData: () => void;
}

const data = {
  eventsData: null,
  setEventsData: null,
  eventsList: [],
  refreshEventsData: () => {},
};

const EventsDataContext = createContext<EventsDataContextInterface>(data);

export default EventsDataContext;
