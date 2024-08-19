import { Calendar, Location } from 'iconsax-react';

const tagHighlights: { [key: string]: string } = {
  Tech: 'bg-blue-500/10 border-2 border-blue-700 text-blue-700',
  Registered: 'bg-green-500 border-2 border-green-500 text-white',
};

export default function EventCard({ event }: { event: EventData }) {
  console.log(event);

  // Map the data fields to the EventCard component with empty string fallbacks
  const eventName = event.name || '';
  const eventCouncil = event.organizer_id
    ? `Organizer ${event.organizer_id}`
    : ''; // Replace with actual logic if available
  const eventDate = event.created_at ? new Date(event.created_at) : null;
  const eventLocation = event.venue || '';
  const eventTags = event.tags || [];
  const eventImage = event.banner_url || '';
  const councilImage = event.logo_image_url || '';

  return (
    <div className="flex h-40 flex-row gap-4 justify-around bg-card-light dark:bg-card-dark rounded-lg p-4 shadow-md">
      {/* Event Image */}
      {eventImage ? (
        <img
          src={eventImage}
          alt={`${eventName} event`}
          className="h-3/4 sm:h-full my-auto aspect-square object-cover rounded-lg"
        />
      ) : (
        <div className="h-3/4 sm:h-full my-auto aspect-square rounded-lg bg-gray-200" />
      )}
      <div className="flex flex-col flex-1 max-w-96 gap-2 justify-around">
        {/* Council Image and Event Name */}
        <div className="flex flex-row gap-2 items-center">
          {councilImage ? (
            <img
              src={councilImage}
              alt={`${eventCouncil} council`}
              className="w-8 h-8 aspect-square rounded-full object-cover border border-vitality-red"
            />
          ) : (
            <div className="w-8 h-8 aspect-square rounded-full bg-gray-200 border border-vitality-red" />
          )}
          <div className="flex flex-col flex-1 text-left">
            <p className="font-fira font-medium text-md sm:text-lg text-foreground-light dark:text-foreground-dark">
              {eventName}
            </p>
            <p className="font-fira text-xs text-vitality-red">
              By {eventCouncil}
            </p>
          </div>
        </div>
        {/* Date and Location */}
        <div className="flex flex-row gap-4 justify-between items-center">
          {eventDate ? (
            <div className="flex flex-row items-center gap-1">
              <Calendar color="#57585A" size="16" />
              <p className="font-fira text-xs text-gray-500 dark:text-gray-300">
                {eventDate.toDateString()}
              </p>
            </div>
          ) : null}
          {eventLocation ? (
            <div className="flex flex-row items-center gap-1">
              <Location color="#57585A" size="16" />
              <p className="font-fira text-xs text-gray-500 dark:text-gray-300">
                {eventLocation}
              </p>
            </div>
          ) : null}
        </div>
        {/* Event Tags */}
        <div className="flex flex-wrap gap-2">
          {eventTags.map((tag: string, index: number) => (
            <span
              key={index}
              className={`font-fira font-semibold text-xs px-2 py-1 rounded-lg ${tagHighlights[tag] || 'bg-gray-200 text-gray-600'}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
