import { Calendar, Location } from "iconsax-react";
import axios from "axios";
import EventsDataContext from "../contexts/EventsDataContext";
import { UserDataContext } from "../contexts/userContext";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
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
    console.log("Event : ", event);
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

                    <div className="flex gap-2 mt-2">
                        {event.urls.instagram && (
                            <a
                                href={event.urls.instagram || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg"
                                title="Instagram"
                            >
                                <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                        )}

                        {event.urls.facebook && (
                            <a
                                href={event.urls.facebook || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg"
                                title="Facebook"
                            >
                                <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                        )}

                        {event.urls.linkedin && (
                            <a
                                href={event.urls.linkedin || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-center w-8 h-8 rounded-full bg-blue-700 hover:bg-blue-800 hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg"
                                title="LinkedIn"
                            >
                                <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                        )}

                        {event.urls.other && (
                            <a
                                href={event.urls.other || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-700 hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg"
                                title="Other Links"
                            >
                                <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                    />
                                </svg>
                            </a>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 justify-center items-center text-foreground">
                    <Link
                        to={`/event/${event.id}`}
                        className="border border-black/20 dark:border-white/20 px-3 h-8 rounded-full text-xs font-fira text-mute hover:text-foreground hover:border-primary/40 transition-all flex items-center"
                    >
                        View Details
                    </Link>
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
