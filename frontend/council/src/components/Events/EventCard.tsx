import { Calendar, Location } from 'iconsax-react';

const tagHighlights: { [key: string]: string } = {
  'Cultural & Fun':
    'bg-orange-500/10 border-2 border-orange-700 text-orange-700',
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
    <div className="h-40 w-[500px] bg-gray-200 rounded-lg flex flex-row p-4 gap-4 justify-start">
      <img
        src={event.image}
        alt="event"
        className="h-full rounded-lg outline outline-1 -outline-offset-1 outline-gray-500"
      />
      <div className="flex flex-col flex-1">
        <div className="flex flex-row gap-4 flex-1">
          <img src={event.councilImage} className="h-10 my-auto" />
          <div className="flex flex-col flex-1 h-full justify-center">
            <p className="font-bold font-fira text-2xl">{event.name}</p>
            <p className="text-sm text-red-800 font-fira">By {event.council}</p>
          </div>
        </div>
        <div className="flex flex-row h-12 my-auto gap-4">
          <div className="flex flex-row gap-2 my-auto">
            <Calendar className="h-6 w-6 my-auto" color="#444444" />
            <p className="text-md font-marcellus">
              {event.date.toDateString()}
            </p>
          </div>
          <div className="flex flex-row gap-2 my-auto">
            <Location className="h-6 w-6 my-auto" color="#444444" />
            <p className="text-md font-marcellus">{event.location}</p>
          </div>
        </div>
        <div className="h-12 flex flex-row my-auto">
          {event.tags.map((tag, index) => (
            <span
              key={index}
              className={`rounded-lg h-8 px-3 py-0.5 ${tagHighlights[tag]} mr-2 text-md font-fira`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
