import React from "react";
import Redbull from '../assets/redbull.jpeg'
import { CalendarDateRangeIcon, MapPinIcon } from "@heroicons/react/20/solid";

const Cards = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-2  border-red-400 ">
            <div className="bg-gray-200 shadow rounded-lg p-4 flex flex-col md:flex-row border-2  border-red-500">
                <div className="md:w-1/2 lg:w-1/2 xl:w-1/2 p-4">
                    <img
                        src={Redbull}
                        className="w-full h-full object-contain"
                    />
                </div>
                <div className="md:ml-4 md:w-1/2 px-10  p-4">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Road to programming
                    </h1>
                    <ul className="mt-4 space-y-4 text-gray-600">
                        <li className="flex gap-x-3">
                            <CalendarDateRangeIcon
                                className="mt-1 h-5 w-5 flex-none text-indigo-600"
                                aria-hidden="true"
                            />
                            <span>
                                <strong className="font-semibold text-gray-900">
                                    Oct 24th, 11:00 pm
                                </strong>
                            </span>
                        </li>
                        <li className="flex gap-x-3">
                            <MapPinIcon
                                className="mt-1 h-5 w-5 flex-none text-indigo-600"
                                aria-hidden="true"
                            />
                            <span>
                                <strong className="font-semibold text-gray-900">
                                    Auditorium
                                </strong>
                            </span>
                        </li>
                    </ul>
                    <p className="mt-4">
                        Et vitae blandit facilisi magna lacus
                    </p>
                </div>
            </div>
            
        </div>
    );
};

export default Cards;
