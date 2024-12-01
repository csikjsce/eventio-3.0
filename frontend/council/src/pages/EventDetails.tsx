import axios from 'axios';
import {
  ArrowLeft,
  Calendar2,
  CalendarAdd,
  Location,
  Send2,
  User,
} from 'iconsax-react';
import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import UserDataContext from '../contexts/UserDataContext';
import Stats from '../components/Stats'; // Import the Stats component

import { Icon as IconType } from 'iconsax-react';

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
      <p className="font-fira text-mute text-xs">{children}</p>
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
      axios
        .request({
          baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
          url: '/api/v1' + `/event/p/get/${id}`,
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
          },
        })
        .then((res) => {
          setEvent(res.data.event);
          setLoading(false);
        });
    };
    if (id) fetchEvent(id);
  }, [id, navigate]);

  if (loading && event == null) {
    return <Loader />;
  } else
    return (
      <>
        <div className="w-full max-w-4xl mx-auto pb-4 flex flex-row gap-8">
          <div className="w-1/2">
            <div
              className="aspect-square relative"
              style={{ backgroundImage: event?.event_page_image_url }}
            >
              <img
                src={event?.event_page_image_url}
                alt="Event Details"
                className="w-screen aspect-square object-cover"
              />
              <Link
                to=".."
                className="absolute top-0 left-0 mt-6 ml-6 h-11 w-11 bg-background rounded-full shadow-sm dark:shadow-white/50 shadow-primary flex items-center justify-center"
              >
                <ArrowLeft size={24} className="stroke-current text-primary " />
              </Link>
              <div className="absolute -bottom-5 right-0 flex justify-end gap-3 mr-6">
                <Send2
                  size={24}
                  color="#fff"
                  variant="Bold"
                  className="bg-primary h-11 w-11 rounded-full pt-2 pr-2 pl-1.5 pb-1.5 hover:cursor-pointer"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: event?.name,
                        url: window.location.href,
                        text: event?.description,
                      });
                    }
                  }}
                />
                <CalendarAdd
                  size={24}
                  color="#fff"
                  variant="Bold"
                  className="bg-primary h-11 w-11 rounded-full p-2 hover:cursor-pointer"
                  onClick={() => {
                    const date =
                      (event?.dates[0] && new Date(event?.dates[0])) ||
                      new Date();
                    const eventTitle = event?.name || 'Eventio event';
                    const eventDetails = event?.description || 'Eventio event';

                    const year = date.getFullYear();

                    const month = String(date.getMonth() + 1).padStart(2, '0');

                    const day = String(date.getDate()).padStart(2, '0');

                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const seconds = String(date.getSeconds()).padStart(2, '0');

                    const startDateTime = `${year}${month}${day}T${hours}${minutes}${seconds}`;
                    const timezone = 'Asia/Kolkata';
                    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                      eventTitle,
                    )}&details=${encodeURIComponent(eventDetails)}&dates=${startDateTime}&ctz=${encodeURIComponent(timezone)}`;
                    window.open(googleCalendarUrl, '_blank');
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col p-8 gap-8 mb-20 text-foreground">
              <div className="flex flex-col gap-1.5 items-start">
                <p className="font-fira text-foreground text-2xl text-left">
                  {event?.name}
                </p>
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
              <div className="h-28 flex flex-col justify-between">
                <hr className="border-1 border-mute" />
                <div className="flex flex-row justify-between">
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
                      event?.venue
                        ? event.venue.slice(event.venue.indexOf(' '))
                        : ''
                    }
                  />
                  <IconText Icon={User} line1="500" line2="Participants" />
                </div>
                <hr className="border-1 border-mute" />
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
            {event?.organizer_id === userData?.id && userData?.id && (
              <Link
                to="./edit"
                className="w-[90%] max-w-sm mx-auto rounded-full bg-primary text-center flex items-center justify-center gap-2 h-12 font-fira normal-case text-lg text-white"
              >
                Edit
              </Link>
            )}
          </div>
          <div className="w-1/2 flex flex-col items-center justify-center">
            <Stats eventId={id} /> {/* Use the Stats component */}
          </div>
        </div>
      </>
    );
}
