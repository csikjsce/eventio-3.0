import React from "react";
import Redbull from '../assets/redbull.jpeg'
import { CalendarDateRangeIcon, MapPinIcon } from "@heroicons/react/20/solid";

const Cards = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 justify-center ml-4 ">
            <div className="bg-gray-100 shadow rounded-lg  p-4 flex flex-col md:flex-row ">
                <div className="md:w-1/2 lg:w-1/2 xl:w-1/2 p-4">
                    <img
                        src={Redbull}
                        className="w-full h-full object-contain rounded-md"
                    />
                </div>
                <div className="md:ml-4 md:w-1/2 px-10 flex justify-center flex-col ">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        CSI KJSCE
                    </h1>
                    <hr className="my-3 border-0 bg-black h-px" />
                    <h2 className="text-3xl  font-bold tracking-tight text-gray-900">
                        Road To Programming
                    </h2>
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
                    <div className="flex flex-row gap-4 mt-3">
                        <button
                            type="button"
                            className="rounded-md bg-green-600 w-28 px-2 py-2 font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2  text-lg "
                        >
                            Approve
                        </button>
                        <button
                            type="button"
                            className="rounded-md bg-red-600 w-28  px-2 py-2 font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2  text-lg focus-visible:outline-indigo-600"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cards;
