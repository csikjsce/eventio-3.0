"use client";

import dayjs, { Dayjs } from "dayjs";
import { useContext, useState } from "react";
import { generateDate, months } from "@/lib/calendar";
import { createGoogleCalendarUrl } from "@/lib/googleCalendar";
import { ArrowSquareLeft, ArrowSquareRight } from "iconsax-react";
import EventList from "@/components/calendar/eventList";
import EventsDataContext from "@/contexts/EventsDataContext";

export default function CalendarScreen() {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const currentDate = dayjs();
  const [today, setToday] = useState(currentDate);
  const [selectDate, setSelectDate] = useState(currentDate);

  const eventsData = useContext(EventsDataContext);

  const events = [
    ...(eventsData.events?.UPCOMING || []),
    ...(eventsData.events?.ONGOING || []),
    ...(eventsData.events?.REGISTRATION_OPEN || []),
    ...(eventsData.events?.REGISTRATION_CLOSED || []),
    ...(eventsData.events?.TICKET_OPEN || []),
    ...(eventsData.events?.TICKET_CLOSED || []),
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
    if (eventList.length === 0)
      return <div className="flex gap-1 justify-center mt-1 h-2" />;

    return (
      <div className="flex gap-0.5 justify-center mt-1">
        {eventList.slice(0, 3).map((event, index) => {
          const colorClass = isPast
            ? "bg-mute"
            : event.state === "REGISTRATION_OPEN"
              ? "bg-green-500"
              : "bg-primary";
          return (
            <div key={index} className={`h-1.5 w-1.5 rounded-full ${colorClass}`} />
          );
        })}
      </div>
    );
  };

  const dateClassName = (currentMonth: boolean, date: Dayjs, isToday?: boolean) => {
    let base =
      "h-9 w-9 rounded-full grid place-content-center text-sm cursor-pointer select-none transition-all";
    if (isToday) return base + " bg-primary text-white";
    if (selectDate.isSame(date, "day"))
      return base + " bg-foreground text-background font-semibold";
    if (currentMonth) return base + " text-foreground hover:bg-surface";
    return base + " text-mute";
  };

  return (
    <div className="pb-36">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground font-poppins">Calendar</h1>
      </div>

      {/* Month navigation */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-foreground font-poppins">
          {months[today.month()]}, {today.year()}
        </h2>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setToday(today.month(today.month() - 1))}
            className="text-primary"
          >
            <ArrowSquareLeft size="28" />
          </button>
          <button
            onClick={() => { setToday(currentDate); setSelectDate(currentDate); }}
            className="text-xs font-poppins text-mute bg-surface rounded-full px-3 py-1"
          >
            Today
          </button>
          <button
            onClick={() => setToday(today.month(today.month() + 1))}
            className="text-primary"
          >
            <ArrowSquareRight size="28" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {days.map((day, index) => (
          <p key={index} className="text-xs text-center text-mute py-2 select-none font-poppins">
            {day}
          </p>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7">
        {generateDate(today.month(), today.year()).map(
          ({ date, currentMonth, today: isToday }, index) => (
            <div key={index} className="flex flex-col items-center py-1">
              <div
                className={dateClassName(currentMonth, date, isToday)}
                onClick={() => setSelectDate(date)}
              >
                {date.date()}
              </div>
              {renderEventIndicators(date)}
            </div>
          ),
        )}
      </div>

      {/* Selected day schedule */}
      <div className="mt-6">
        <h3 className="font-semibold text-foreground font-poppins mb-1">
          {getEventsForDate(selectDate).length !== 0
            ? `${selectDate.format("MMMM D, YYYY")}`
            : `No events on ${selectDate.format("MMMM D, YYYY")}`}
        </h3>

        {getEventsForDate(selectDate).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 mb-4">
            {getEventsForDate(selectDate).map((event, index) => (
              <a
                key={index}
                href={createGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-3 py-1 bg-primary text-white text-xs rounded-full font-poppins"
              >
                + {event.name}
              </a>
            ))}
          </div>
        )}

        <EventList events={getEventsForDate(selectDate)} date={selectDate} />
      </div>
    </div>
  );
}
