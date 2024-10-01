import { createContext } from 'react';
import { Dispatch } from 'react';

interface EventsDataContextInterface {
  eventsData: Events | null;
  setEventsData: Dispatch<Events> | null;
}

const data = {
  eventsData: null,
  setEventsData: null,
};

const EventsDataContext = createContext<EventsDataContextInterface>(data);

export default EventsDataContext;
