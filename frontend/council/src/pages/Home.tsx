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

  const statCards = [
    { label: 'Total Events', value: events.length, color: 'text-zinc-100' },
    {
      label: 'Registration Open',
      value: eventsList.filter((e) => e.state === 'REGISTRATION_OPEN').length,
      color: 'text-green-400',
    },
    {
      label: 'Ongoing',
      value: eventsList.filter((e) => e.state === 'ONGOING').length,
      color: 'text-yellow-400',
    },
    {
      label: 'Completed',
      value: eventsList.filter((e) => e.state === 'COMPLETED').length,
      color: 'text-zinc-400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080808] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {userData?.photo_url ? (
            <img
              src={userData.photo_url}
              alt="user"
              className="w-12 h-12 rounded-full border border-red-600/40 object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-500 font-bold text-lg">
              {userData?.name?.[0] ?? 'D'}
            </div>
          )}
          <div>
            <p className="text-zinc-400 text-xs font-fira">Welcome back</p>
            <h1 className="text-white text-xl font-marcellus">{userData?.name}</h1>
          </div>
        </div>
        <Link
          to="new-event"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-fira font-semibold rounded-lg transition-colors duration-150"
        >
          <span className="text-lg leading-none">+</span>
          New Event
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-[#111] border border-white/5 rounded-xl p-5"
          >
            <p className="text-zinc-500 text-xs font-fira mb-2">{s.label}</p>
            <p className={`text-3xl font-bold font-fira ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="mb-8">
        <Calendar />
      </div>

      {/* Events list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-marcellus">Your Events</h2>
        <span className="text-zinc-500 text-xs font-fira">{events.length} event{events.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex flex-col gap-3">
        {events.length === 0 && (
          <div className="bg-[#111] border border-white/5 rounded-xl p-12 text-center">
            <p className="text-zinc-500 font-fira text-sm">No events yet.</p>
            <Link to="new-event" className="text-red-500 text-sm font-fira hover:underline mt-2 inline-block">Create your first event →</Link>
          </div>
        )}
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}