import { createContext } from 'react';
import { EventsDataContextInterface } from '../types/eventsDataContextInterface';

const eventsData = {
  events: null,
  setEvents: null,
};

export default createContext<EventsDataContextInterface>(eventsData);
