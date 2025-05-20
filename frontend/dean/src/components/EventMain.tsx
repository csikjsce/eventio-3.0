import { Calendar, Location } from "iconsax-react";
import axios from "axios";
import EventsDataContext from "../contexts/EventsDataContext";
import { UserDataContext } from "../contexts/userContext";
import { useContext, useState } from "react";
import EventDialog from "./EventDialog";

export default function EventMain({ event }: { event: EventData }) {
    const { refreshEventsData } = useContext(EventsDataContext);
    const { userData } = useContext(UserDataContext);
    const [isOpen, setIsOpen] = useState(false);
    const [isRejected, setIsRejected] = useState<boolean>(false);

    async function approve(sendToPrincipal = false) {
        try {
            const newState = sendToPrincipal 
                ? "APPLIED_FOR_PRINCI_APPROVAL" 
                : "UNLISTED";
                
            const res = await axios.request({
                baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
                url: "/api/v1" + "/event/p/update/" + event.id,
                method: "POST",
                headers: {
                    Authorization:
                        "Bearer " + localStorage.getItem("accessToken"),
                },
                data: {
                    state: newState,
                    comment: null,
                },
            });
            console.log(res.data);
            refreshEventsData();
        } catch (error) {
            console.error(error);
        }
    }

    async function reject(comment: string) {
        try {
            const res = await axios.request({
                baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
                url: "/api/v1" + "/event/p/update/" + event.id,
                method: "POST",
                headers: {
                    Authorization:
                        "Bearer " + localStorage.getItem("accessToken"),
                },
                data: {
                    state: "DRAFT",
                    comment,
                },
            });
            console.log(res.data);
            refreshEventsData();
        } catch (error) {
            console.error(error);
        }
    }

    const isPrincipal = userData?.role === "PRINCIPAL";

    return (
        <div className="w-full outline outline-1 outline-card rounded-lg">
            <EventDialog
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                approval={approve}
                reject={reject}
                isRejected={isRejected}
                showPrincipalOption={!isPrincipal}
            />
            <div>
                <img
                    src={event.banner_url}
                    alt={event.name}
                    className="w-full rounded-t-lg max-h-56 object-cover"
                />
            </div>
            <div className="p-4 bg-card rounded-b-lg flex gap-2">
                <img
                    src={event.organizer.photo_url}
                    alt={event.name}
                    className="h-16 w-16 my-auto rounded-full"
                />
                <div className="my-auto flex-1">
                    <h1 className="text-mute">
                        <strong className="text-xl text-foreground font-marcellus tracking-wide">
                            {event.name}
                        </strong>{" "}
                        by {event.organizer.name}
                    </h1>
                    <div className="flex gap-3 text-foreground">
                        <div className="flex gap-1 items-center">
                            <Calendar
                                color="currentColor"
                                className="text-primary"
                                size="20"
                            />
                            <p>
                                {event.dates[0] &&
                                    new Date(event.dates[0]).toDateString()}
                            </p>
                        </div>
                        <div className="flex gap-1 items-center">
                            <Location
                                color="currentColor"
                                className="text-primary"
                                size="20"
                            />
                            <p>{event.venue}</p>
                        </div>
                    </div>
                    <p className="text-mute">{event.description}</p>
                </div>
                <div className="flex gap-2 justify-center items-center text-foreground">
                    <button
                        className="border border-green-600 w-16 h-8 p-1 rounded-full hover:bg-green-600 hover:text-white active:bg-green-700"
                        onClick={() => {
                            setIsRejected(false);
                            setIsOpen(true);
                        }}
                    >
                        ✓
                    </button>
                    <button
                        className="border border-red-600 w-16 h-8 p-1 rounded-full hover:bg-red-600 hover:text-white active:bg-red-700"
                        onClick={() => {
                            setIsRejected(true);
                            setIsOpen(true);
                        }}
                    >
                        X
                    </button>
                </div>
            </div>
        </div>
    );
}