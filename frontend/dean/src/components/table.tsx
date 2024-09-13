import React from "react";
import { CheckIcon } from "@heroicons/react/20/solid";

const people = [
    {
        name: "CSI KJSCE",
        event: "Road to Programming",
        venue: "Auditorium",
        time: "7 - 9 pm",
        description: "RTP is the fuckoing sdsdfsdf s fs fs kdlkajlskdjhflkasjdhlk lakjsdh ",
        imageUrl:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        href: "#",
    },
    {
        name: "Michael Foster",
        email: "michael.foster@example.com",
        imageUrl:
            "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        href: "#",
    },
    {
        name: "Dries Vincent",
        email: "dries.vincent@example.com",
        imageUrl:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        href: "#",
    },
    {
        name: "Lindsay Walton",
        email: "lindsay.walton@example.com",
        imageUrl:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        href: "#",
    },
    {
        name: "Courtney Henry",
        email: "courtney.henry@example.com",
        imageUrl:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        href: "#",
    },
    {
        name: "Tom Cook",
        email: "tom.cook@example.com",
        imageUrl:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        href: "#",
    },
];

export default function Example() {
    return (
        <div>
            <ul
                role="list"
                className="divide-y ml-20 mt-9 scale-110 divide-gray-300"
            >
                {people.map((person) => (
                    <li
                        key={person.email}
                        className="flex items-center justify-between gap-x-6 py-5"
                    >
                        <div
                            className="flex min-w-0 gap-x-4 "
                            style={{ width: "750px" }}
                        >
                            <div className="flex items-top">
                                <img
                                    className="h-12 w-12 rounded-full bg-gray-50"
                                    src={person.imageUrl}
                                    alt=""
                                />
                                {/* Other child elements */}
                            </div>
                            <div className="min-w-0 flex-auto">
                                <p className="text-xl font-semibold leading-6 text-gray-900">
                                    {person.name}
                                </p>
                                <p className="mt-1 truncate text-lg leading-5 text-gray-700">
                                    {person.event}
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

                                        {person.time}
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

                                        {person.venue}
                                    </p>
                                </div>
                                <p className="text-md mt-3 overflow-wrap break-word leading-5 text-gray-500">
                                    {person.description}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-row gap-4">
                            <a className="rounded-full bg-white px-2.5 py-1  text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-green-300 ">
                                <CheckIcon className="h-5 w-5 " />
                            </a>
                            <a className="rounded-full bg-white px-2.5 py-1   text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-300">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18 18 6M6 6l12 12"
                                    />
                                </svg>
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
            <a
                href="#"
                className="flex w-full items-center justify-center rounded-md bg-white px-3 ml-8 mt-5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
            >
                View all
            </a>
        </div>
    );
}
