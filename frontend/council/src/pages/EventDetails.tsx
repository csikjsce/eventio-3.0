import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar2,
  CalendarAdd,
  Location,
  Send2,
  User,
} from 'iconsax-react';
import { Icon as IconType } from 'iconsax-react';
import Loader from '../components/Loader';
import UserDataContext from '../contexts/UserDataContext';
import Stats from '../components/Stats';

function IconText({
  Icon,
  line1,
  line2,
}: {
  Icon: IconType;
  line1: string;
  line2: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <Icon size={30} color="#B61F2D" variant="Bold" />
      <p className="font-fira text-mute text-sm mt-2">{line1}</p>
      <p className="font-fira text-mute text-sm">{line2}</p>
    </div>
  );
}

function Passage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 items-start text-left">
      <p className="font-fira text-foreground text-lg">{title}</p>
      <p className="font-fira text-mute text-sm">{children}</p>
    </div>
  );
}

export default function EventDetails() {
  const [event, setEvent] = useState<EventData | null>(null);
  const { userData } = useContext(UserDataContext);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async (id: string) => {
      try {
        const res = await axios.request({
          baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
          url: '/api/v1' + `/event/p/get/${id}`,
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
          },
        });
        setEvent(res.data.event);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event:', error);
        setLoading(false);
      }
    };
    if (id) fetchEvent(id);
  }, [id, navigate]);

  if (!id) {
    return <Navigate to="/" />;
  }

  if (loading && event == null) {
    return <Loader />;
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/4 space-y-8">
            <div className="relative">
              <img
                src={event?.event_page_image_url}
                alt="Event Details"
                className="w-full aspect-square object-cover rounded-lg shadow-lg"
              />
              <Link
                to=".."
                className="absolute top-4 left-4 h-10 w-10 bg-background rounded-full shadow-sm flex items-center justify-center"
              >
                <ArrowLeft size={20} className="stroke-current text-primary" />
              </Link>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="font-fira text-foreground text-3xl font-bold">
                  {event?.name}
                </h1>
                <p className="font-fira text-mute text-sm">
                  {event?.dates[0] &&
                    new Date(event?.dates[0]).toDateString().slice(0, -5)}{' '}
                  at{' '}
                  {event?.dates[0] &&
                    new Date(event?.dates[0]).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                </p>
              </div>
              <div className="flex justify-between py-4 border-y border-mute">
                <IconText
                  Icon={Calendar2}
                  line1={
                    (event?.dates[0] &&
                      new Date(event?.dates[0]).toDateString().slice(0, -5)) ||
                    ''
                  }
                  line2={
                    (event?.dates[0] &&
                      new Date(event?.dates[0]).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })) ||
                    ''
                  }
                />
                <IconText
                  Icon={Location}
                  line1={
                    event?.venue
                      ? event.venue.split(' ')[0]
                      : 'Location not specified'
                  }
                  line2={
                    event?.venue && event.venue.split(' ').length > 1
                      ? event.venue.slice(event.venue.indexOf(' '))
                      : ''
                  }
                />
                <IconText Icon={User} line1="500" line2="Participants" />
              </div>
              {event?.start_in_event_activity && (
                <Passage title="Event Activity">
                  <a href={event?.in_event_activity} className="text-blue-600">
                    {event?.in_event_activity || ''}
                  </a>
                </Passage>
              )}
              <Passage title="About the Event">
                {event?.long_description || ''}
              </Passage>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: event?.name,
                        url: window.location.href,
                        text: event?.description,
                      });
                    }
                  }}
                  className="bg-primary text-white rounded-full p-3 hover:bg-primary-dark transition-colors"
                  aria-label="Share event"
                >
                  <Send2 size={24} />
                </button>
                <button
                  onClick={() => {
                    const date =
                      (event?.dates[0] && new Date(event?.dates[0])) ||
                      new Date();
                    const eventTitle = event?.name || 'Eventio event';
                    const eventDetails = event?.description || 'Eventio event';
                    const startDateTime =
                      date.toISOString().replace(/[-:]/g, '').split('.')[0] +
                      'Z';
                    const timezone = 'Asia/Kolkata';
                    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                      eventTitle,
                    )}&details=${encodeURIComponent(eventDetails)}&dates=${startDateTime}/${startDateTime}&ctz=${encodeURIComponent(timezone)}`;
                    window.open(googleCalendarUrl, '_blank');
                  }}
                  className="bg-primary text-white rounded-full p-3 hover:bg-primary-dark transition-colors"
                  aria-label="Add to calendar"
                >
                  <CalendarAdd size={24} />
                </button>
              </div>
              {event?.organizer_id === userData?.id && userData?.id && (
                <Link
                  to="./edit"
                  className="px-6 py-2 bg-primary text-white rounded-full font-fira text-lg hover:bg-primary-dark transition-colors"
                >
                  Edit Event
                </Link>
              )}
            </div>
          </div>
          {event?.organizer_id === userData?.id && userData?.id && (
            <div className="w-full lg:w-3/4 lg:mt-0">
              <Stats eventId={id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
