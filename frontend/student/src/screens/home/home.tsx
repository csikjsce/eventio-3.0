import { useContext } from 'react';
import EventCard from '../../components/EventCard';

import TrendingCard from '../../components/TrendingCard';

import EventsDataContext from '../../contexts/EventsDataContext';

export default function Home() {
  const { events } = useContext(EventsDataContext);

  return (
    <div className="flex flex-col">
      {/* <SearchBar Icon={SearchNormal1} className="mt-6" /> */}
      <div className="flex flex-col mt-6 gap-4 z-10">
        <p className="text-lg font-medium font-fira text-left text-foreground-light dark:text-foreground-dark">
          Trending Events
        </p>
        <div className="overflow-x-auto flex gap-4 pb-6 px-4 -mx-4">
          {events?.UPCOMING?.map((event) => (
            <TrendingCard key={event.id} event={event} text="Coming Soon" />
          ))}
          {events?.ONGOING?.map((event) => (
            <TrendingCard key={event.id} event={event} text="Ongoing" />
          ))}
          {events?.REGISTRATION_OPEN?.map((event) => (
            <TrendingCard
              key={event.id}
              event={event}
              text="Registrations Open"
            />
          ))}
          {events?.TICKET_OPEN?.map((event) => (
            <TrendingCard
              key={event.id}
              event={event}
              text="Tickets Released"
            />
          ))}
        </div>
      </div>
      {events?.UPCOMING && events?.UPCOMING.length != 0 && (
        <div className="flex flex-col gap-4 z-10">
          <p className="text-lg font-medium font-fira text-left text-foreground-light dark:text-foreground-dark">
            Upcoming Events
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto">
            {events?.UPCOMING?.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
      {events?.REGISTRATION_OPEN && events?.REGISTRATION_OPEN.length != 0 && (
        <div className="flex flex-col gap-4 z-10">
          <p className="text-lg font-medium font-fira text-left text-foreground-light dark:text-foreground-dark">
            Registration Open
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto">
            {events?.REGISTRATION_OPEN?.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
      {events?.TICKET_OPEN && events?.TICKET_OPEN.length != 0 && (
        <div className="flex flex-col gap-4 z-10">
          <p className="text-lg font-medium font-fira text-left text-foreground-light dark:text-foreground-dark">
            Tickets Released
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto">
            {events?.TICKET_OPEN?.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
