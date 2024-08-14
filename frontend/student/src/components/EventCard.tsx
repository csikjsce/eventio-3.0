import { Calendar, Location } from 'iconsax-react';

const tagHighlights: { [key: string]: string } = {
  Tech: 'bg-blue-500/10 border-2 border-blue-700 text-blue-700',
  Registered: 'bg-green-500 border-2 border-green-500 text-white',
};

export default function EventCard({
  event,
}: {
  event: {
    name: string;
    council: string;
    image: string;
    councilImage: string;
    date: Date;
    location: string;
    tags: string[];
  };
}) {
  return (
    <div className="flex h-40 flex-row gap-2 justify-around bg-card-light dark:bg-card-dark rounded-lg p-2"> { /* TODO: imporve sizing and styling */ }
      <img
        src={event.image}
        alt="event"
        className="h-3/4 sm:h-full my-auto aspect-square object-cover rounded-lg"
      />
      <div className="flex flex-col flex-1 max-w-96 gap-1 justify-around">
        <div className="flex flex-row gap-2 items-center">
          {/* council pic and event name */}
          <img
            src={event.councilImage}
            alt="man1"
            className="w-8 h-8 aspect-square rounded-full object-cover border border-vitality-red"
          />
          <div className="flex flex-col flex-1 text-left">
            <p className="font-fira font-medium text-md sm:text-lg text-foreground-light dark:text-foreground-dark">{event.name}</p>
            <p className="font-fira text-xs text-vitality-red">By {event.council}</p>
          </div>
        </div>
        <div className="flex flex-row gap-2 justify-around">
          <div className="flex flex-row gap-1">
            <Calendar color="#57585A" size="16" /> { /* TODO: use Tailwind theme */ }
            <p className="font-fira text-xs text-gray-1">{event.date.toDateString()}</p>
          </div>
          <div className="flex flex-row gap-1">
            <Location color="#57585A" size="16" /> { /* TODO: use Tailwind theme */ }
            <p className="font-fira text-xs text-gray-1">{event.location}</p>
          </div>
        </div>
        <div className="flex flex-row gap-2 px-2">
          {event.tags.map((tag) => (
            <span
              className={`font-fira font-semibold text-xs px-2 py-1 rounded-lg ${tagHighlights[tag]}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
