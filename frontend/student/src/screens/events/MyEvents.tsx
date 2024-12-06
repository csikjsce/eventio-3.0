import axios from 'axios';
import { useState, useEffect } from 'react';

import EventCard from '../../components/EventCard';

export default function MyEvents() {
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    async function fetchMyEvents() {
      const response = await axios.request({
        baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
        url: '/api/v1' + `/event/p/get/me`,
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
        },
      });
      setEvents(response.data.events.map((e: { event: EventData }) => e.event));
    }
    fetchMyEvents();
  }, []);

  return (
    <>
      <p className="mt-4 text-2xl text-foreground">My Events</p>
      <div className="mt-4">
        {events.map((event) => (
          <EventCard event={event} key={event.id} />
        ))}
      </div>
    </>
  );
}
