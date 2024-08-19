import Event from './event';
import { EventType } from '../../types/EventType';

type Props = {
  events: EventType[];
  date: number;
};

const EventList = ({ events, date }: Props) => {
  console.log(date);
  return (
    <div className="pb-20 ">
      {events.map((event, index) => (
        <Event
          key={index}
          council={event.council}
          date={date}
          title={event.title}
          type={event.type}
          startTime={event.startTime}
        />
      ))}
    </div>
  );
};

export default EventList;
