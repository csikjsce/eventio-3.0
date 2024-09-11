import { Dispatch, SetStateAction } from 'react';

interface EventsDataContextInterface {
  events: Events | null;
  setEvents: Dispatch<SetStateAction<Events | null>> | null;
}
