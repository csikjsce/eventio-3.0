import { useContext } from 'react';
import EventCard from '../../components/EventCard';

import TrendingCard from '../../components/TrendingCard';

import EventsDataContext from '../../contexts/EventsDataContext';

function parentFilterOut(event: EventData) {
  return event.children.length === 0;
}

function childFilterOut(event: EventData) {
  return event.parent_id === null;
}

export default function Home() {
  const { events } = useContext(EventsDataContext);

  return (
    <div className="flex flex-col">
      {/* <SearchBar Icon={SearchNormal1} className="mt-6" /> */}
      <div className="flex flex-col mt-6 gap-4 z-10">
        <p className="text-lg font-medium font-fira text-left text-foreground ">
          Trending Events
        </p>
        <div className="overflow-x-auto flex gap-4 pb-6 px-4 -mx-4">
          {events?.TICKET_OPEN?.filter(childFilterOut).map((event) => (
            <TrendingCard key={event.id} event={event} text="RSVP Now!!" />
          ))}
          {events?.ONGOING?.filter(childFilterOut).map((event) => (
            <TrendingCard key={event.id} event={event} text="Ongoing" />
          ))}
          {events?.REGISTRATION_OPEN?.filter(childFilterOut).map((event) => (
            <TrendingCard
              key={event.id}
              event={event}
              text="Registrations Open"
            />
          ))}
          {events?.UPCOMING?.filter(childFilterOut).map((event) => (
            <TrendingCard key={event.id} event={event} text="Coming Soon" />
          ))}
        </div>
      </div>
      {events?.UPCOMING.filter(parentFilterOut) &&
        events?.UPCOMING.filter(parentFilterOut).length != 0 && (
          <div className="flex flex-col gap-4 z-10">
            <p className="text-lg font-medium font-fira text-left text-foreground ">
              Upcoming Events
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto -mx-1">
              {events?.UPCOMING?.filter(parentFilterOut).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      {events?.REGISTRATION_OPEN.filter(parentFilterOut) &&
        events?.REGISTRATION_OPEN.filter(parentFilterOut).length != 0 && (
          <div className="flex flex-col gap-4 z-10">
            <p className="text-lg font-medium font-fira text-left text-foreground ">
              Registration Open
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto -mx-1">
              {events?.REGISTRATION_OPEN?.filter(parentFilterOut).map(
                (event) => <EventCard key={event.id} event={event} />,
              )}
            </div>
          </div>
        )}
      {events?.TICKET_OPEN?.filter(parentFilterOut) &&
        events?.TICKET_OPEN?.filter(parentFilterOut).length != 0 && (
          <div className="flex flex-col gap-4 z-10">
            <p className="text-lg font-medium font-fira text-left text-foreground ">
              Tickets Released
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto -mx-1">
              {events?.TICKET_OPEN?.filter(parentFilterOut).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
