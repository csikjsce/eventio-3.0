import Calendar from "../components/calendar/Calendar";
import EventMain from "../components/EventMain";
import { useContext } from "react";
import EventsDataContext from "../contexts/EventsDataContext";

import GreetingSection from "../components/Greeting";

export default function Home() {
    const { eventsData } = useContext(EventsDataContext);

    return (
        <div className="flex justify-between gap-3">
            <div className="flex-1 flex flex-col gap-4 overflow-y-scroll px-3">
                <GreetingSection />
                {eventsData?.APPLIED_FOR_APPROVAL.map((event) => (
                    <EventMain key={event.id} event={event} />
                ))}
            </div>
            <Calendar />
        </div>
    );
}
