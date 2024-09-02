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
          image={event.banner_url}
          id={event.id}
          startTime={dayjs(events[0].dates.find((d) => date.isSame(d, 'day')))
            .toDate()
            .toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
        />
      ))}
    </div>
  );
};

export default EventList;
