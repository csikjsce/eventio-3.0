import dayjs from 'dayjs';
import FooterNav from '../../components/FooterNav';
import { useState } from 'react';
import { generateDate, months } from '../../utils/calendar';
import { ArrowSquareLeft, ArrowSquareRight } from 'iconsax-react';
import Header from '../../components/Header';
import { EventType } from '../../types/EventType';
import EventList from '../../components/calendar/eventList';
import { Tooltip } from '@material-tailwind/react';

const events: EventType[] = [
  {
    council: 'student_council',
    dates: [dayjs().format('YYYY-MM-DD')],
    title: 'Meeting with Bob',
    type: 'internal',
    startTime: '10:00 AM',
  },
  {
    council: 'student_council',
    dates: [dayjs().add(1, 'day').format('YYYY-MM-DD')],
    title: 'Conference Call',
    type: 'external',
    startTime: '11:00 AM',
  },
  {
    council: 'student_council',
    dates: [dayjs().subtract(1, 'day').format('YYYY-MM-DD')],
    title: 'Team Lunch',
    type: 'social',
    startTime: '12:00 PM',
  },
  {
    council: 'student_council',
    dates: [dayjs().add(2, 'days').format('YYYY-MM-DD')],
    title: 'Project Deadline',
    type: 'deadline',
    startTime: '09:00 AM',
  },
  {
    council: 'student_council',
    dates: [dayjs().add(2, 'days').format('YYYY-MM-DD')],
    title: 'Code Review',
    type: 'review',
    startTime: '02:00 PM',
  },
  {
    council: 'student_council',
    dates: [dayjs().add(2, 'days').format('YYYY-MM-DD')],
    title: 'Interview',
    type: 'interview',
    startTime: '03:00 PM',
  },
  {
    council: 'student_council',
    dates: [dayjs().add(2, 'days').format('YYYY-MM-DD')],
    title: 'Design Meeting',
    type: 'meeting',
    startTime: '04:00 PM',
  },
];

export default function Calendar() {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const currentDate = dayjs();
  const [today, setToday] = useState(currentDate);
  const [selectDate, setSelectDate] = useState(currentDate);

  const getEventsForDate = (date: dayjs.Dayjs) =>
    events.filter((event) =>
      event.dates.some((eventDateString) =>
        dayjs(eventDateString).isSame(date, 'day'),
      ),
    );

  const renderEventIndicators = (date: dayjs.Dayjs) => {
    const eventList = getEventsForDate(date);
    const isPast = date.isBefore(currentDate, 'day');
    const indicators = eventList.slice(0, 3).map((_, index) => {
      const colorClass = isPast
        ? 'bg-gray-400'
        : index % 2 === 0
          ? 'bg-red-500'
          : 'bg-green-500';
      return (
        <div key={index} className={`h-2 w-2 rounded-full ${colorClass}`} />
      );
    });

    return <div className="flex gap-1 justify-center mt-1">{indicators}</div>;
  };

  return (
    <div className="flex flex-col p-4">
      <Header />
      <div className="flex gap-10 sm:divide-x justify-center sm:w-1/2 h-full items-center sm:flex-row flex-col mt-10">
        <div className="w-full h-96 px-5">
          <div className="flex justify-between items-center">
            <h1 className="select-none font-semibold">
              {months[today.month()]}, {today.year()}
            </h1>
            <div className="flex gap-10 items-center">
              <ArrowSquareLeft
                size="32"
                className="text-primary"
                onClick={() => {
                  setToday(today.month(today.month() - 1));
                }}
              />

              <h1
                className="cursor-pointer hover:scale-105 transition-all"
                onClick={() => {
                  setToday(currentDate);
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
                  <Tooltip
                    key={index}
                    content={`${eventCount} event${
                      eventCount !== 1 ? 's' : ''
                    }`}
                  >
                    <div className="p-2 text-center h-14 grid place-content-center text-sm border-t">
                      <div
                        className={`
                          ${currentMonth ? '' : 'text-gray-400'} 
                          ${today ? 'bg-red-600 text-white' : ''} 
                          ${selectDate.isSame(date, 'day') ? 'bg-black text-white' : ''} 
                          h-10 w-10 rounded-full grid place-content-center text-foreground-light dark:text-foreground-dark hover:bg-black hover:text-white transition-all cursor-pointer select-none
                        `}
                        onClick={() => setSelectDate(date)}
                      >
                        {date.date()}
                      </div>
                      {renderEventIndicators(date)}
                    </div>
                  </Tooltip>
                );
              },
            )}
          </div>
          <div className="w-full max-w-sm mt-6">
            <h1 className="font-semibold">
              Schedule for {selectDate.format('MMMM D, YYYY')}
            </h1>

            <EventList
              events={getEventsForDate(selectDate)}
              date={selectDate.date()}
            />
          </div>
        </div>
      </div>
      <FooterNav />
    </div>
  );
}
