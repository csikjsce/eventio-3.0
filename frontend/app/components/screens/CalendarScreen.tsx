"use client";

import dayjs from "dayjs";
import { useContext, useState } from "react";
import { generateDate, months } from "@/lib/calendar";
import { ArrowLeft2, ArrowRight2, Calendar2 } from "iconsax-react";
import EventsDataContext from "@/contexts/EventsDataContext";
import Link from "next/link";
import type { EventData } from "@/types/eventio";

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/* ─── Status colours ─── */
const STATUS_META: Record<
  string,
  { label: string; bg: string; dot: string; text: string }
> = {
  UPCOMING:            { label: "Upcoming",    bg: "bg-violet-500/15", dot: "bg-violet-400", text: "text-violet-400" },
  REGISTRATION_OPEN:   { label: "Open",        bg: "bg-green-500/15",  dot: "bg-green-400",  text: "text-green-400"  },
  REGISTRATION_CLOSED: { label: "Closed",      bg: "bg-surface",       dot: "bg-mute",       text: "text-mute"       },
  TICKET_OPEN:         { label: "RSVP Open",   bg: "bg-amber-500/15",  dot: "bg-amber-400",  text: "text-amber-400"  },
  TICKET_CLOSED:       { label: "RSVP Closed", bg: "bg-surface",       dot: "bg-mute",       text: "text-mute"       },
  ONGOING:             { label: "Ongoing",     bg: "bg-sky-500/15",    dot: "bg-sky-400",    text: "text-sky-400"    },
  COMPLETED:           { label: "Completed",   bg: "bg-surface",       dot: "bg-mute",       text: "text-mute"       },
};

/* ─── Event card in timeline ─── */
function TimelineCard({ event }: { event: EventData }) {
  const meta = STATUS_META[event.state] ?? STATUS_META.UPCOMING;
  const startTime = event.dates[0]
    ? dayjs(event.dates[0]).format("hh:mm A")
    : "TBA";
  const endTime = event.dates[0]
    ? dayjs(event.dates[0]).add(2, "hour").format("hh:mm A")
    : "";

  return (
    <div className="flex gap-3 items-stretch">
      <div className="w-16 flex flex-col items-end pt-1 flex-shrink-0">
        <span className="text-xs font-poppins text-foreground font-medium">{startTime}</span>
        <div className="flex-1 flex justify-center mt-1.5">
          <div className="w-px bg-border min-h-6" />
        </div>
        <span className="text-xs font-poppins text-mute pb-1">{endTime}</span>
      </div>

      <Link
        href={`/event-details/${event.id}`}
        className={`flex-1 rounded-2xl p-4 mb-4 flex gap-3 items-center ${meta.bg} border border-border/30`}
      >
        <img
          src={event.logo_image__url}
          alt={event.name}
          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />
            <span className={`text-[10px] font-poppins font-semibold ${meta.text}`}>
              {meta.label}
            </span>
          </div>
          <p className="font-poppins font-semibold text-sm text-foreground truncate">
            {event.name}
          </p>
          <p className="font-poppins text-xs text-mute truncate">{event.organizer.name}</p>
        </div>
      </Link>
    </div>
  );
}

/* ─── Main screen ─── */
export default function CalendarScreen() {
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
    ...(eventsData.events?.COMPLETED || []),
  ];

  const getEventsForDate = (date: dayjs.Dayjs) =>
    events.filter((e) => e.dates.some((d) => dayjs(d).isSame(date, "day")));

  const selectedEvents = getEventsForDate(selectDate).sort((a, b) =>
    dayjs(a.dates[0]).diff(dayjs(b.dates[0])),
  );

  /* generateDate returns Sun-first; re-order to Mon-first */
  const rawDates = generateDate(today.month(), today.year());
  /* Shift: move leading Sunday to end of that week group */
  const monFirstDates = (() => {
    const reordered = [...rawDates];
    /* generateDate pads with Sun=0 at start; we want Mon=1 first.
       Simplest: build our own Mon-first grid. */
    const firstOfMonth = today.startOf("month");
    const grid: { date: dayjs.Dayjs; currentMonth: boolean; today?: boolean }[] = [];
    // leading days (Mon=1 … weekday of first)
    const leadingCount = (firstOfMonth.day() + 6) % 7; // 0=Mon…6=Sun
    for (let i = leadingCount - 1; i >= 0; i--)
      grid.push({ date: firstOfMonth.subtract(i + 1, "day"), currentMonth: false });
    // current month
    for (let d = 0; d < today.daysInMonth(); d++) {
      const date = firstOfMonth.add(d, "day");
      grid.push({
        date,
        currentMonth: true,
        today: date.isSame(currentDate, "day"),
      });
    }
    // trailing days to complete last row
    const trailing = (7 - (grid.length % 7)) % 7;
    for (let i = 1; i <= trailing; i++)
      grid.push({ date: today.endOf("month").add(i, "day"), currentMonth: false });
    return grid;
  })();

  return (
    <div className="pb-36">
      {/* Page title */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-foreground font-poppins">Calendar</h1>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setToday(today.subtract(1, "month"))}
          className="w-9 h-9 flex items-center justify-center rounded-full active:bg-surface"
        >
          <ArrowLeft2 size={18} color="#8a8a8a" />
        </button>

        <button
          onClick={() => { setToday(currentDate); setSelectDate(currentDate); }}
          className="font-poppins font-bold text-lg text-foreground"
        >
          {months[today.month()]} {today.year()}
        </button>

        <button
          onClick={() => setToday(today.add(1, "month"))}
          className="w-9 h-9 flex items-center justify-center rounded-full active:bg-surface"
        >
          <ArrowRight2 size={18} color="#8a8a8a" />
        </button>
      </div>

      {/* Day labels — Mon first */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map((d) => (
          <p key={d} className="text-xs text-center text-mute font-poppins font-medium py-1 select-none">
            {d}
          </p>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-y-1 mb-6">
        {monFirstDates.map(({ date, currentMonth, today: isToday }, idx) => {
          const isSelected = selectDate.isSame(date, "day");
          const hasEvents = getEventsForDate(date).length > 0;

          return (
            <div key={idx} className="flex flex-col items-center gap-0.5 py-0.5">
              <button
                onClick={() => setSelectDate(date)}
                className={`h-9 w-9 rounded-full grid place-content-center text-sm font-poppins font-medium select-none transition-all ${
                  isSelected
                    ? "bg-foreground text-background font-bold"
                    : isToday
                      ? "ring-2 ring-primary text-primary"
                      : currentMonth
                        ? "text-foreground hover:bg-surface"
                        : "text-mute/40"
                }`}
              >
                {date.date()}
              </button>
              {/* Event dot */}
              {hasEvents && (
                <div
                  className={`w-1 h-1 rounded-full ${
                    isSelected ? "bg-background" : "bg-primary"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-border mb-5" />

      {/* Schedule header */}
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-xs font-poppins text-mute uppercase tracking-widest mb-0.5">
            {selectDate.isSame(currentDate, "day") ? "Today" : selectDate.format("dddd")}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-poppins font-bold text-4xl text-foreground leading-none">
              {selectDate.date()}
            </span>
            <span className="font-poppins text-mute text-sm">
              {selectDate.format("MMMM")}
            </span>
          </div>
        </div>
        <span className="text-xs font-poppins text-mute bg-card border border-border px-3 py-1 rounded-full">
          {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Event timeline */}
      {selectedEvents.length > 0 ? (
        <div>
          {selectedEvents.map((event) => (
            <TimelineCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Calendar2 size={44} color="#2e2e2e" variant="Bold" />
          <p className="font-poppins text-mute text-sm">No events on this day</p>
        </div>
      )}
    </div>
  );
}
