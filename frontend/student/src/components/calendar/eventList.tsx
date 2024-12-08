import dayjs, { Dayjs } from 'dayjs';
import Event from './event';

type Props = {
  events: EventData[];
  date: Dayjs;
};

const EventList = ({ events, date }: Props) => {
  return (
    <div className="pb-20 ">
      {events.map((event, index) => (
        <Event
          key={index}
          council={event.organizer.name}
          date={date}
          title={event.name}
          image={event.event_page_image_url}
          id={event.id}
          startTime={dayjs(
            event.dates.find((d) => date.isSame(d, 'day')),
          ).format('hh:mm A')}
        />
      ))}
    </div>
  );
};

export default EventList;
