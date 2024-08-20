import { useNavigate } from 'react-router-dom';

export default function TrendingCard({ event }: { event: EventData }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (event.id) {
      navigate(`/event-details/${event.id}`);
    } else {
      console.error('Event ID is missing');
    }
  };
  return (
    <div
      className="min-w-[97%] flex flex-col mr-1 gap-2 bg-card-light dark:bg-card-dark rounded-b-lg cursor-pointer shadow-lg"
      onClick={handleClick}
    >
      {/* Event picture */}
      <img
        src={event.banner_url}
        alt={event.name}
        className="w-full h-40 object-cover rounded-t-lg"
      />
      {/* Event details */}
      <div className="p-2 pt-0 flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          {/* Council picture and event name */}
          <img
            src={event.organizer.photo_url}
            alt="Event Logo"
            referrerPolicy="no-referrer"
            className="w-10 h-10 aspect-square rounded-full object-cover border border-vitality-red"
          />
          <div className="flex flex-col text-left">
            <p className="font-fira font-semibold text-lg text-foreground-light dark:text-foreground-dark">
              {event.name}
            </p>
            <p className="font-fira text-xs text-foreground-light dark:text-foreground-dark">
              {new Date(event.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start">
          <p className="text-sm font-fira text-foreground-light dark:text-foreground-dark">
            Register Now
          </p>
        </div>
      </div>
    </div>
  );
}
