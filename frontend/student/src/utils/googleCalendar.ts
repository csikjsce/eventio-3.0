/**
 * Creates a URL that will add an event to Google Calendar
 */
export const createGoogleCalendarUrl = (event: any) => {
  // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ format)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  // Use first date from event.dates as start date
  const startDate = event.dates && event.dates.length > 0 ? formatDate(event.dates[0]) : '';
  
  // Use last date from event.dates as end date, or fallback to start date + 1 hour
  let endDate = '';
  if (event.dates && event.dates.length > 1) {
    endDate = formatDate(event.dates[event.dates.length - 1]);
  } else if (event.dates && event.dates.length === 1) {
    // If only one date is available, set end time to 1 hour after start
    const end = new Date(event.dates[0]);
    end.setHours(end.getHours() + 1);
    endDate = formatDate(end.toISOString());
  }

  // Encode event details
  const text = encodeURIComponent(event.name || 'Event');
  const details = encodeURIComponent(event.description || '');
  const location = encodeURIComponent(event.venue || '');

  // Create Google Calendar URL
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
};