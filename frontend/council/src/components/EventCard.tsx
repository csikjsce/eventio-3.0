import { Calendar, Location } from 'iconsax-react';
import { Link } from 'react-router-dom';

const tagHighlights: { [key: string]: string } = {
  Tech: 'bg-blue-500/10 border-2 border-blue-700 text-blue-700',
  Registered: 'bg-green-500 border-2 border-green-500 text-white',
};

export default function EventCard({ event }: { event: EventData }) {
  return (
    <Link
      className="flex flex-row gap-4 justify-around bg-card  rounded-lg p-3 shadow-md mb-2 mx-1"
      to={'/event-details/' + event.id}
    >
      {/* Event Image */}

      <img
        src={event.logo_image__url}
        alt={`${event.name} event`}
        className="h-full max-h-28 my-auto aspect-square object-cover rounded-lg"
      />
      <div className="flex flex-col flex-1 max-w-96 gap-2 justify-around">
        {/* Council Image and Event Name */}
        <div className="flex flex-row gap-2 items-center">
          <img
            src={event.organizer.photo_url}
            alt={`${event.organizer.name} council`}
            className="w-8 h-8 aspect-square rounded-full object-cover border border-vitality"
          />
          <div className="flex flex-col flex-1 text-left">
            <p className="font-fira font-medium text-md sm:text-lg text-foreground ">
              {event.name}
            </p>
            <p className="font-fira text-xs text-vitality">
              By {event.organizer.name}
            </p>
          </div>
        </div>
        {/* Date and Location */}
        <div className="flex flex-col gap-2 items-start justify-end">
          <div className="flex flex-row items-center gap-1">
            <Calendar className="stroke-current text-vitality" size="20" />
            <p className="font-fira text-sm text-mute dark:text-gray-300">
              {event.dates[0] && new Date(event.dates[0]).toDateString()}
            </p>
          </div>
          <div className="flex flex-row items-center gap-1">
            <Location className="stroke-current text-vitality" size="20" />
            <p className="font-fira text-sm text-mute dark:text-gray-300">
              {event.venue}
            </p>
          </div>
        </div>
        {/* Event Tags */}
        <div className="flex flex-wrap gap-2">
          {event.tags.map((tag: string, index: number) => (
            <span
              key={index}
              className={`font-fira font-semibold text-xs px-2 py-1 rounded-lg ${tagHighlights[tag] || 'bg-gray-200 text-gray-600'}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
