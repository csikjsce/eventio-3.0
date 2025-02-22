import { useContext, useEffect, useState } from 'react';
import UserDataContext from '../contexts/UserDataContext';
import EventsDataContext from '../contexts/EventsDataContext';
import EventCard from '../components/EventCard';
import { Link } from 'react-router-dom';
import Calendar from '../components/calendar/Calendar.tsx';
import ScannerPage from './scanner';

export default function Home() {
  const { userData } = useContext(UserDataContext);
  const { eventsList } = useContext(EventsDataContext);
  const events = eventsList.filter(
    (event) => event.organizer_id === Number(userData?.id),
  );

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <ScannerPage />
      </div>
    );
  }  

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
      <Calendar />
      <div className="flex justify-between items-center">
        <p className="text-2xl text-foreground font-fira">Your Events</p>
        <Link
          to="new-event"
          className="p-2 bg-vitality rounded-lg text-white font-fira"
        >
          Create New
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}