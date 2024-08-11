import EventCard from '../components/Events/EventCard';
import Divider from '../components/Events/Divider';

import image1 from '../assets/demoImages/image1.png';
import image2 from '../assets/demoImages/image2.png';

const event = {
  name: "Naari '23 Celebration",
  council: 'Student Council, KJSCE',
  image: image1,
  councilImage: image2,
  date: new Date(1698125400 * 1000),
  location: 'Auditorium',
  tags: ['Cultural & Fun', 'Registered'],
};

function EventList() {
  return (
    <div className="flex flex-col gap-4 flex-1 overflow-y-auto outline outline-2 p-4 rounded-lg">
      <EventCard event={event} />
      <Divider text="Upcoming Events" />
      <EventCard event={event} />
      <EventCard event={event} />
      <EventCard event={event} />
      <Divider text="Past Events" />
      <EventCard event={event} />
      <EventCard event={event} />
      <EventCard event={event} />
    </div>
  );
}

export default function Events() {
  return (
    <div className="max-h-[96vh] flex flex-col gap-4 p-4">
      <div className="flex flex-row items-center">
        <div>
          <h1 className="text-4xl font-bold font-fira">Events</h1>
          <p className="text-gray-500 font-fira">Your events</p>
        </div>
        <button className="ml-auto max-h-16 bg-red-500 text-white rounded-lg px-4 py-2 font-fira">
          Create Event
        </button>
      </div>
      <EventList />
    </div>
  );
}
