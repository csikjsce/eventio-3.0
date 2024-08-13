import { Brodcast } from 'iconsax-react';

export default function TrendingCard({
  event,
}: {
  event: {
    name: string;
    image: string;
    councilImage: string;
    shortDesc: string;
    status: string;
  };
}) {
  return (
    <div className="w-92 flex flex-col mr-1 gap-2 bg-gray-100 rounded-b-lg">
      {/* event pic */}
      <img
        src={event.image}
        alt="abhi"
        className="w-full h-40 object-cover rounded-t-lg"
      />
      {/* event details */}
      <div className="p-2 pt-0 flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          {/* council pic and event name */}
          <img
            src={event.councilImage}
            alt="man1"
            className="w-10 h-10 aspect-square rounded-full object-cover border border-red-500"
          />
          <div className="flex flex-col text-left">
            <p className="font-fira font-semibold text-lg">{event.name}</p>
            <p className="font-fira text-xs">{event.shortDesc}</p>
          </div>
        </div>
        <div className="flex flex-col items-start">
          <p className="font-fira text-xs text-gray-600">Event is</p>
          <div className="flex flex-row gap-1">
            <Brodcast size={16} color="#B61F2D" />
            <p className="font-fira text-xs text-gray-600">{event.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
