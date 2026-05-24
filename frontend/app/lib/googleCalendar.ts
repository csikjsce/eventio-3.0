import type { EventData } from "@/types/eventio";

export const createGoogleCalendarUrl = (event: EventData) => {
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const startDate =
    event.dates && event.dates.length > 0 ? formatDate(event.dates[0]) : "";

  let endDate = "";
  if (event.dates && event.dates.length > 1) {
    endDate = formatDate(event.dates[event.dates.length - 1]);
  } else if (event.dates && event.dates.length === 1) {
    const end = new Date(event.dates[0]);
    end.setHours(end.getHours() + 1);
    endDate = formatDate(end.toISOString());
  }

  const text = encodeURIComponent(event.name || "Event");
  const details = encodeURIComponent(event.description || "");
  const location = encodeURIComponent(event.venue || "");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
};
