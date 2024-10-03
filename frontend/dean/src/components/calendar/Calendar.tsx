import dayjs, { Dayjs } from "dayjs";
import { useContext, useState } from "react";
import { generateDate, months } from "../../lib/calendar";

import { ArrowSquareLeft, ArrowSquareRight } from "iconsax-react";

import EventList from "./eventList";

import EventsDataContext from "../../contexts/EventsDataContext";

export default function Calendar() {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    const currentDate = dayjs();
    const [today, setToday] = useState(currentDate);
    const [selectDate, setSelectDate] = useState(currentDate);

    const { eventsData } = useContext(EventsDataContext);
    const events = [
        ...(eventsData?.UPCOMING || []),
        ...(eventsData?.ONGOING || []),
        ...(eventsData?.REGISTRATION_OPEN || []),
        ...(eventsData?.REGISTRATION_CLOSED || []),
        ...(eventsData?.TICKET_OPEN || []),
        ...(eventsData?.TICKET_CLOSED || []),
        ...(eventsData?.ONGOING || []),
        ...(eventsData?.COMPLETED || []),
        ...(eventsData?.APPLIED_FOR_APPROVAL || []),
    ];

    const getEventsForDate = (date: dayjs.Dayjs) =>
        events.filter((event) =>
            event.dates.some((eventDateString) =>
                dayjs(eventDateString).isSame(date, "day"),
            ),
        );

    const renderEventIndicators = (date: dayjs.Dayjs) => {
        const eventList = getEventsForDate(date);
        const isPast = date.isBefore(currentDate, "day");
        let indicators;
        if (eventList.length !== 0) {
            indicators = eventList.slice(0, 3).map((event, index) => {
                const colorClass = isPast
                    ? "bg-gray-400"
                    : event.state === "REGISTRATION_OPEN"
                      ? "bg-green-500"
                      : "bg-red-500";
                return (
                    <div
                        key={index}
                        className={`h-2 w-2 rounded-full ${colorClass}`}
                    />
                );
            });
        } else {
            indicators = <div className={`h-2 w-2 rounded-full`} />;
        }

        return (
            <div className="flex gap-1 justify-center mt-1">{indicators}</div>
        );
    };

    const dateClassName = (
        currentMonth: boolean,
        date: Dayjs,
        today?: boolean,
    ) => {
        let className =
            "h-10 w-10 rounded-full grid place-content-center hover:bg-black hover:text-white hover:dark:bg-white hover:dark:text-black transition-all cursor-pointer select-none peer relative";
        if (today) {
            className +=
                " bg-primary text-white dark:bg-primary dark:text-white";
            return className;
        }
        if (selectDate.isSame(date, "day")) {
            className += " bg-black text-white dark:bg-white dark:text-black";
        } else {
            if (currentMonth) {
                className += " text-black dark:text-white";
            } else {
                className += " text-mute dark:text-gray-400";
            }
        }
        return className;
    };

    return (
        <div className="flex gap-10 max-w-sm justify-center h-full items-center flex-col">
            <div className="w-full h-full px-5">
                <div className="flex justify-between items-center">
                    <h1 className="select-none font-semibold text-foreground ">
                        {months[today.month()]}, {today.year()}
                    </h1>
                    <div className="flex gap-5 items-center">
                        <ArrowSquareLeft
                            size="32"
                            className="text-primary"
                            onClick={() => {
                                setToday(today.month(today.month() - 1));
                            }}
                        />

                        <h1
                            className="cursor-pointer hover:scale-105 transition-all text-foreground "
                            onClick={() => {
                                setToday(currentDate);
                                setSelectDate(currentDate);
                            }}
                        >
                            Today
                        </h1>
                        <ArrowSquareRight
                            size="32"
                            className="text-primary"
                            onClick={() => {
                                setToday(today.month(today.month() + 1));
                            }}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-7">
                    {days.map((day, index) => (
                        <h1
                            key={index}
                            className="text-sm text-center h-14 w-14 grid place-content-center text-gray-500 select-none"
                        >
                            {day}
                        </h1>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {generateDate(today.month(), today.year()).map(
                        ({ date, currentMonth, today }, index) => {
                            const eventsForDate = getEventsForDate(date);
                            const eventCount = eventsForDate.length;

                            return (
                                <div key={index}>
                                    <div className="p-2 text-center h-14 grid place-content-center text-sm border-t relative">
                                        <div
                                            className={dateClassName(
                                                currentMonth,
                                                date,
                                                today,
                                            )}
                                            onClick={() => setSelectDate(date)}
                                        >
                                            {date.date()}
                                        </div>
                                        <span className="absolute hidden peer-hover:flex justify-center items-center align-middle transition-all mx-auto mb-8 -translate-y-8 left-1/2 -translate-x-1/2 w-20 h-8 z-40 px-1 text-sm text-center rounded-md bg-foreground text-background cursor-default select-none">{`${eventCount} event${eventCount !== 1 ? "s" : ""}`}</span>
                                        {renderEventIndicators(date)}
                                    </div>
                                </div>
                            );
                        },
                    )}
                </div>
                <div className="w-full max-w-sm mt-6">
                    <h1 className="font-semibold text-foreground ">
                        {getEventsForDate(selectDate).length !== 0
                            ? `Schedule for ${selectDate.format("MMMM D, YYYY")}`
                            : `No events on ${selectDate.format("MMMM D, YYYY")}`}
                    </h1>

                    <EventList events={getEventsForDate(selectDate)} />
                </div>
            </div>
        </div>
    );
}
