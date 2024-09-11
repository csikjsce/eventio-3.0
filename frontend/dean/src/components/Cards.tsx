import React from "react";
import Redbull from '../assets/redbull.jpeg'
import { CalendarDateRangeIcon, MapPinIcon, ClockIcon } from "@heroicons/react/20/solid";

const Cards = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 justify-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {[1, 2].map((index) => (
                <div
                    key={index}
                    className="bg-gray-100 shadow rounded-lg overflow-hidden flex flex-col w-full"
                >
                    <div className="w-full h-60">
                        <img
                            src={Redbull}
                            className="w-full h-full object-cover"
                            alt="Event"
                        />
                    </div>
                    <div className="p-4 flex flex-col">
                        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
                            CSI KJSCE
                        </h1>
                        <hr className="my-3 border-0 bg-black h-px" />
                        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
                            Road To Programming
                        </h2>
                        <ul className="mt-4 space-y-4 text-gray-600">
                            <li className="flex gap-x-3">
                                <CalendarDateRangeIcon
                                    className="mt-1 h-5 w-5 flex-none text-indigo-600"
                                    aria-hidden="true"
                                />
                                <span>
                                    <strong className="font-semibold text-xl text-gray-900">
                                        Oct 24th 2024
                                    </strong>
                                </span>
                            </li>
                            <li className="flex gap-x-3">
                                <ClockIcon
                                    className="mt-1 h-5 w-5 flex-none text-indigo-600"
                                    aria-hidden="true"
                                />
                                <span>
                                    <strong className="font-semibold text-xl text-gray-900">
                                        4:00 - 7:00 pm
                                    </strong>
                                </span>
                            </li>
                            <li className="flex gap-x-3">
                                <MapPinIcon
                                    className="mt-1 h-5 w-5 flex-none text-indigo-600"
                                    aria-hidden="true"
                                />
                                <span>
                                    <strong className="font-semibold text-xl text-gray-900">
                                        Auditorium
                                    </strong>
                                </span>
                            </li>
                        </ul>
                        <p className="mt-4 break-words whitespace-normal overflow-hidden">
                            Et vitae blandit facilisi magna
                            lacusklaj;lsdkjfa;lskdjf;alskdjf;alskdjf;alksdj;laksjdf;lksdjhfas;ldkfj;alskdjf;alskdjf;laskjdf;lksdjf
                        </p>
                        <div className="flex flex-row gap-7 justify-start mt-6">
                            <button
                                type="button"
                                className="rounded-md bg-green-600 w-28 px-2 py-2 font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 text-lg"
                            >
                                Approve
                            </button>
                            <button
                                type="button"
                                className="rounded-md bg-red-600 w-28 px-2 py-2 font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 text-lg focus-visible:outline-indigo-600"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Cards;
