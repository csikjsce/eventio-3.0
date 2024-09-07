import { useNavigate } from 'react-router-dom';

export default function TrendingCard({
  event,
  text,
}: {
  event: EventData;
  text: string;
}) {
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
      className="min-w-[97%] flex flex-col gap-2 bg-card  rounded-b-lg cursor-pointer shadow-lg"
      onClick={handleClick}
    >
      {/* Event picture */}
      <img
        src={event.banner_url}
        alt={event.name}
        className="w-full h-40 object-cover rounded-t-lg"
      />
      {/* Event details */}
      <div className="pb-2 pl-2 pr-1 pt-0 flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          {/* Council picture and event name */}
          <img
            src={event.organizer.photo_url}
            alt="Event Logo"
            referrerPolicy="no-referrer"
            className="w-10 h-10 aspect-square rounded-full object-cover border border-vitality"
          />
          <div className="text-left">
            <p className="font-fira font-semibold text-lg text-foreground ">
              {event.name}
            </p>
            <p className="font-fira text-xs text-foreground ">
              {event.dates
                .map((dateString) => new Date(dateString).toLocaleDateString())
                .join(', ')}
            </p>
          </div>
        </div>
        <p className="text-xs text-wrap mx-0.5 font-fira text-center text-foreground ">
          {text}
        </p>
      </div>
    </div>
  );
}
