import { useState, useContext, Fragment, useEffect } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import EventsDataContext from "../contexts/EventsDataContext";
import axios from "axios";

export default function IntegratedTableModal() {
    const { eventsData } = useContext(EventsDataContext);
    const events = [
        ...(eventsData?.UPCOMING || []),
        ...(eventsData?.ONGOING || []),
        ...(eventsData?.REGISTRATION_OPEN || []),
        ...(eventsData?.REGISTRATION_CLOSED || []),
        ...(eventsData?.TICKET_OPEN || []),
        ...(eventsData?.TICKET_CLOSED || []),
        ...(eventsData?.ONGOING || []),
        ...(eventsData?.APPLIED_FOR_APPROVAL || []),
    ];
    console.log(eventsData);
    const [open, setOpen] = useState(false);
    const [selectedevent, setSelectedevent] = useState(null);
    useEffect(() => {
        console.log(events);
    }
    , [events]);
    
    const handleApprove = (e, event_id) => {
        e.stopPropagation();
        try{
            axios
            .request({
                baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
                url: "/api/v1" + "/event/p/update/" + event_id,
                method: "POST",
                headers: {
                          Authorization:
                              "Bearer " + localStorage.getItem("accessToken"),
                      },
                data: {
                    state: "UNLISTED",
                },
            }).then((response) => {
                console.log(response.data);
                window.location.reload();
            }
            )
        }catch(err){
            console.error(err);
        }
    
        
    };
    const handleReject = (e, event_id) => {
        e.stopPropagation();
        try{
            axios
            .request({
                baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
                url: "/api/v1" + "/event/p/update/" + event_id,
                method: "POST",
                headers: {
                          Authorization:
                              "Bearer " + localStorage.getItem("accessToken"),
                      },
                data: {
                    state: "DRAFT",
                },
            }).then((response) => {
                console.log(response.data);
                window.location.reload();
            }
            )
        }catch(err){
            console.error(err);
        }
    
        
    };
    const openModal = (event) => {
        setSelectedevent(event);
        setOpen(true);
    };
    
    if (events.length === 0 || !events) {
        return <div className="flex p-4 pl-10 text-2xl">No events left for approval</div>;
    }
    return (
        <div className="flex">

            <ul
                role="list"
                className="divide-y ml-20 mt-9 scale-110 divide-gray-300"
            >
                {events.map((event, index) => (
                    <li
                        key={index}
                        className="flex items-center justify-between gap-x-6 py-5 cursor-pointer"
                        onClick={() => openModal(event)}
                    >
                        <div
                            className="flex min-w-0 gap-x-4 "
                            style={{ width: "750px" }}
                        >
                            <div className="flex items-top">
                                <img
                                    className="h-12 w-12 rounded-full bg-gray-50"
                                    src={event.organizer.photo_url}
                                    alt=""
                                />
                            </div>
                            <div className="min-w-0 flex-auto">
                                <p className="text-xl font-semibold leading-6 text-gray-900">
                                    {event.organizer.name}
                                </p>
                                <p className="mt-1 truncate text-lg leading-5 text-gray-700">
                                    {event.event}
                                </p>
                                <div className="flex flex-row gap-6">
                                    <p className="mt-2 -ml-1 flex flex-row truncate text-md leading-5 text-gray-700">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="black"
                                            className="size-5 mr-1"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                            />
                                        </svg>
                                        {(event?.dates[0] &&
                                            new Date(
                                                event?.dates[0],
                                            ).toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })) ||
                                            ""}
                                    </p>
                                    <p className="mt-2 flex flex-row truncate text-md leading-5 text-gray-700">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="black"
                                            className="size-5 mr-1"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                            />
                                        </svg>
                                        {event.venue}
                                    </p>
                                </div>
                                <p className="text-md mt-3 overflow-wrap break-word leading-5 text-gray-500">
                                    {event.description}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-row gap-4">
                            <button
                                onClick={(e) => handleApprove(e, event.id)}
                                className="group relative flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-green-300 transition-all duration-300 ease-in-out overflow-hidden"
                            >
                                <CheckIcon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={(e) => handleReject(e, event.id)}
                                className="group relative flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-300 transition-all duration-300 ease-in-out overflow-hidden"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-5 w-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18 18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={setOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 scale-125 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                    <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                        <button
                                            type="button"
                                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            onClick={() => setOpen(false)}
                                        >
                                            <span className="sr-only">
                                                Close
                                            </span>
                                            <XMarkIcon
                                                className="h-6 w-6"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <img
                                                className=" scale-110 rounded-full bg-gray-50"
                                                src={
                                                    selectedevent?.organizer
                                                        .photo_url
                                                }
                                                alt=""
                                            />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <Dialog.Title
                                                as="h3"
                                                className="text-lg font-semibold leading-6 text-gray-900"
                                            >
                                                {selectedevent
                                                    ? selectedevent.name
                                                    : "Event Details"}
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <p className="text-md text-gray-500">
                                                    {selectedevent
                                                        ? selectedevent.long_description
                                                        : "No description available."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
}
