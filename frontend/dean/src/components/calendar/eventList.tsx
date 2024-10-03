import Event from "./event";

const EventList = ({ events }: { events: EventData[] }) => {
    return (
        <div className="">
            {events.map((event) => (
                <Event key={event.id} event={event} />
            ))}
        </div>
    );
};

export default EventList;
