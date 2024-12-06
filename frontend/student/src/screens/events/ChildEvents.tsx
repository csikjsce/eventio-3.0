import { useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import EventsDataContext from '../../contexts/EventsDataContext';
import EventCard from '../../components/EventCard';

export default function MyEvents() {
  const { id } = useParams();
  const { events } = useContext(EventsDataContext);

  const eventsList = [
    ...(events?.UPCOMING || []),
    ...(events?.REGISTRATION_OPEN || []),
    ...(events?.REGISTRATION_CLOSED || []),
    ...(events?.TICKET_OPEN || []),
    ...(events?.TICKET_CLOSED || []),
    ...(events?.ONGOING || []),
  ];

  const parent = eventsList.find((event) => event.id === Number(id));
  if (!parent) {
    return <Navigate to="/" />;
  }
  const childrenIds = parent.children.map((child) => child.id);
  const childrenEvents = eventsList.filter((event) =>
    childrenIds.includes(event.id),
  );

  return (
    <div className="p-4 text-foreground">
      <div className="flex justify-between items-center">
        <div className="font-marcellus">
          <p className="text-2xl">{parent.name}</p>
          <p className="text-md text-mute">{parent.description}</p>
        </div>
        <img
          src={parent.event_page_image_url}
          alt={parent.name}
          className="w-20 h-20 rounded-lg object-cover"
        />
      </div>
      <div className="mt-4">
        {childrenEvents.map((event) => (
          <EventCard event={event} key={event.id} />
        ))}
      </div>
    </div>
  );
}
