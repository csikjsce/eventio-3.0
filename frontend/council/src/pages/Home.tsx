import { useContext, useEffect, useState } from 'react';
import UserDataContext from '../contexts/UserDataContext';
import EventsDataContext from '../contexts/EventsDataContext';
import EventCard from '../components/EventCard';
import { Link, useNavigate } from 'react-router-dom';
import Calendar from '../components/calendar/Calendar.tsx';
import ScannerPage from './scanner';
import { LayoutList, CalendarDays, Copy } from 'lucide-react';

export default function Home() {
  const { userData } = useContext(UserDataContext);
  const { eventsList } = useContext(EventsDataContext);
  const events = eventsList.filter(
    (event) => event.organizer_id === Number(userData?.id),
  );
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  function duplicateEvent(ev: EventData) {
    navigate('/new-event', { state: { duplicate: ev } });
  }

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
    <div className="min-h-screen bg-[#121214] p-8">
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
            className="bg-[#1c1c1e] border border-white/5 rounded-xl p-5"
          >
            <p className="text-zinc-500 text-xs font-fira mb-2">{s.label}</p>
            <p className={`text-3xl font-bold font-fira ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Events list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-marcellus">Your Events</h2>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 text-xs font-fira">{events.length} event{events.length !== 1 ? 's' : ''}</span>
          <div className="flex gap-0.5 bg-[#1c1c1e] border border-white/[0.06] rounded-lg p-1">
            <button type="button" onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-red-600/80 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <LayoutList size={14} />
            </button>
            <button type="button" onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-red-600/80 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <CalendarDays size={14} />
            </button>
          </div>
        </div>
      </div>
      {viewMode === 'calendar' && <Calendar />}
      {viewMode === 'list' && (
        <div className="flex flex-col gap-3">
          {events.length === 0 && (
            <div className="bg-[#1c1c1e] border border-white/5 rounded-xl p-12 text-center">
              <p className="text-zinc-500 font-fira text-sm">No events yet.</p>
              <Link to="new-event" className="text-red-500 text-sm font-fira hover:underline mt-2 inline-block">Create your first event →</Link>
            </div>
          )}
          {events.map((event) => (
            <div key={event.id} className="relative group">
              <EventCard event={event} />
              <button
                type="button"
                onClick={() => duplicateEvent(event)}
                title="Duplicate event"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-2.5 py-1.5 bg-[#252527] border border-white/10 hover:border-red-600/40 text-zinc-400 hover:text-white text-[11px] font-fira rounded-lg z-10"
              >
                <Copy size={11} /> Duplicate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}