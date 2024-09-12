import { useContext } from 'react';
import UserDataContext from '../contexts/UserDataContext';
import EventsDataContext from '../contexts/EventsDataContext';
import EventCard from '../components/EventCard';
import { Link } from 'react-router-dom';

export default function Home() {
  const { userData } = useContext(UserDataContext);
  const { eventsData } = useContext(EventsDataContext);
  return (
    <div className="p-8 flex flex-col gap-6 overflow-y-auto">
      <div className="flex gap-3 text-foreground">
        <img
          src={userData?.photo_url}
          alt="user"
          className="w-20 h-20 rounded-full border-2 border-primary"
        />
        <div className="my-auto">
          <h1 className="text-2xl font-bold">{userData?.name}</h1>
          <p className="text-mute">{userData?.email}</p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-2xl text-foreground font-fira">Your Events</p>
        <Link
          to="new-event"
          className="p-2 bg-vitality rounded-lg text-white font-fira"
        >
          Create New
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        {eventsData?.REGISTRATION_OPEN?.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {eventsData?.REGISTRATION_OPEN?.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {eventsData?.REGISTRATION_OPEN?.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {eventsData?.REGISTRATION_OPEN?.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {eventsData?.REGISTRATION_OPEN?.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {eventsData?.REGISTRATION_OPEN?.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {eventsData?.REGISTRATION_OPEN?.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
