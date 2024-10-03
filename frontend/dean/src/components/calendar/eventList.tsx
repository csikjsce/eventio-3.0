import dayjs, { Dayjs } from "dayjs";
import Event from "./event";

type Props = {
    events: EventData[];
    date: Dayjs;
};

const EventList = ({ events, date }: Props) => {
    return (
        <div className="">
            {events.map((event) => (
                <Event
                    key={event.id}
                    event={event}
                    startTime={dayjs(
                        event.dates.find((d) => date.isSame(d, "day")),
                    ).format("hh:mm A")}
                />
            ))}
        </div>
    );
};

export default EventList;
