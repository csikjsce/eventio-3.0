import { useState, Fragment } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const people = [
    {
        name: "CSI KJSCE",
        event: "Road to Programming",
        venue: "Auditorium",
        time: "7 - 9 pm",
        description:
            "RTP is the fuckoing sdsdfsdf s fs fs kdlkajlskdjhflkasjdhlk lakjsdh ",
        fulldescription:
            "RTP blkajdsblfkjablkjdsfblalakjsf laksjdbf alskjdfb alksdjfb alskdjfb alsdkjfb alskdjfb lkajsdfb laksjdfb aslkdjfb asldkfjb lakjbsdf alksjdf ",
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

export default function IntegratedTableModal() {
    const [open, setOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);

    const handleApprove = (e) => {
        e.stopPropagation();
        // idhar logic daal lode
        console.log("Approved");
    };

    const handleReject = (e) => {
        e.stopPropagation();
        // idahr bhi
        console.log("Rejected");
    };

    const openModal = (person) => {
        setSelectedPerson(person);
        setOpen(true);
    };

    return (
        <div>
            <ul
                role="list"
                className="divide-y ml-20 mt-9 scale-110 divide-gray-300"
            >
                {people.map((person, index) => (
                    <li
                        key={index}
                        className="flex items-center justify-between gap-x-6 py-5 cursor-pointer"
                        onClick={() => openModal(person)}
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
                            <button
                                onClick={handleApprove}
                                className="group relative flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-green-300 transition-all duration-300 ease-in-out overflow-hidden"
                            >
                                <CheckIcon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={handleReject}
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
            <a
                href="#"
                className="flex w-full items-center justify-center rounded-md bg-white px-3 ml-8 mt-5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
            >
                View all
            </a>

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
                                                src={selectedPerson?.imageUrl}
                                                alt=""
                                            />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <Dialog.Title
                                                as="h3"
                                                className="text-lg font-semibold leading-6 text-gray-900"
                                            >
                                                {selectedPerson
                                                    ? selectedPerson.name
                                                    : "Event Details"}
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <p className="text-md text-gray-500">
                                                    {selectedPerson
                                                        ? selectedPerson.fulldescription
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
