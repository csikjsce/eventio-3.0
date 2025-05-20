import Calendar from "../components/calendar/Calendar";
import EventMain from "../components/EventMain";
import { useContext, useEffect, useState } from "react";
import EventsDataContext from "../contexts/EventsDataContext";
import { UserDataContext } from "../contexts/userContext";
import GreetingSection from "../components/Greeting";

export default function Home() {
    const { eventsData } = useContext(EventsDataContext);
    const { userData } = useContext(UserDataContext);
    const [filteredEvents, setFilteredEvents] = useState<EventData[]>([]);

    useEffect(() => {
        if (!eventsData || !userData) {
            setFilteredEvents([]);
            return;
        }

        console.log("Events data:", eventsData);
        console.log("User role:", userData.role);

        let relevantEvents: EventData[] = [];
        
        if (userData.role === "PRINCIPAL") {
            // Principal should see events waiting for principal approval
            const principalEvents = eventsData.APPLIED_FOR_PRINCI_APPROVAL || [];
            relevantEvents = [...principalEvents];
        } else if (userData.role === "FACULTY") {
            // Faculty should see events waiting for faculty approval
            const facultyEvents = eventsData.APPLIED_FOR_APPROVAL || [];
            relevantEvents = [...facultyEvents];
        }
        
        console.log("Filtered events:", relevantEvents);
        setFilteredEvents(relevantEvents);
        
    }, [eventsData, userData]);

    return (
        <div className="flex justify-between gap-3">
            <div className="flex-1 flex flex-col gap-4 overflow-y-scroll px-3">
                <GreetingSection />
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                        <EventMain key={event.id} event={event} />
                    ))
                ) : (
                    <div className="text-mute text-center mt-8">
                        <p>No events requiring approval</p>
                        {userData?.role === "PRINCIPAL" && 
                            <p className="mt-2 text-sm">
                                Events will appear here when faculty members forward them for your approval
                            </p>
                        }
                        {userData?.role === "FACULTY" && 
                            <p className="mt-2 text-sm">
                                Events will appear here when organizers submit them for approval
                            </p>
                        }
                    </div>
                )}
            </div>
            <Calendar />
        </div>
    );
}