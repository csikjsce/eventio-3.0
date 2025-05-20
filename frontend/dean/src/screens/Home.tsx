import Calendar from "../components/calendar/Calendar";
import EventMain from "../components/EventMain";
import { useContext } from "react";
import EventsDataContext from "../contexts/EventsDataContext";
import { UserDataContext } from "../contexts/userContext";

import GreetingSection from "../components/Greeting";

export default function Home() {
    const { eventsData } = useContext(EventsDataContext);
    const { userData } = useContext(UserDataContext);

    let events: EventData[] = [];
    
    // Role-based event filtering
    if (userData?.role === "PRINCIPAL") {
        events = eventsData?.APPLIED_FOR_PRINCI_APPROVAL || [];
    } else if (userData?.role === "FACULTY") {
        events = eventsData?.APPLIED_FOR_APPROVAL || [];
    }

    return (
        <div className="flex justify-between gap-3">
            <div className="flex-1 flex flex-col gap-4 overflow-y-scroll px-3">
                <GreetingSection />
                {events.length > 0 ? (
                    events.map((event) => (
                        <EventMain key={event.id} event={event} />
                    ))
                ) : (
                    <p className="text-mute text-center mt-8">No events requiring approval</p>
                )}
            </div>
            <Calendar />
        </div>
    );
}