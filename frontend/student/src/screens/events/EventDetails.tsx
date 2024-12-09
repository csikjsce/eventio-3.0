import axios from 'axios';
import {
  ArrowLeft,
  Calendar2,
  CalendarAdd,
  Location,
  Send2,
  User,
  TickCircle,
} from 'iconsax-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import IconText from '../../components/IconText';
import Loader from '../../components/Loader';
import Passage from '../../components/Passage';
import Spinner from '../../components/Spinner';
import FeedbackModal from '../../components/FeedbackModal';

export default function EventDetails() {
  const [event, setEvent] = useState<EventData | null>(null);

  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const [isFeedbackPopupOpen, setIsFeedbackPopupOpen] = useState(false);

  const [buttonState, setButtonState] = useState<{
    text: string;
    loading: boolean;
    disabled: boolean;
    onClick: () => void;
  }>({
    text: 'Loading...',
    loading: true,
    disabled: true,
    onClick: () => {},
  });

  const { id } = useParams();
  const register = useCallback(() => {
    setButtonState({
      text: 'Registering',
      loading: true,
      disabled: true,
      onClick: () => {},
    });
    axios
      .request({
        baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
        url: '/api/v1' + `/event/p/register-for-event`,
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
        },
        data: {
          event_id: id,
        },
      })
      .then(() => {
        setButtonState({
          text: 'Registered',
          loading: false,
          disabled: true,
          onClick: () => {},
        });
        setSnackbarVisible(true);
        setTimeout(() => setSnackbarVisible(false), 3000); // Hide after 3 seconds
      })
      .catch(() => {
        setButtonState({
          text: 'Register',
          loading: false,
          disabled: false,
          onClick: register,
        });
      });
  }, [id]);
  const claimTicket = useCallback(() => {
    setButtonState({
      text: 'RSVPing',
      loading: true,
      disabled: true,
      onClick: () => {},
    });
    axios
      .request({
        baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
        url: '/api/v1' + `/event/p/claim-ticket`,
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
        },
        data: {
          event_id: id,
        },
      })
      .then(() => {
        setButtonState({
          text: 'View Ticket',
          loading: false,
          disabled: false,
          onClick: () => {
            navigate('/ticket/' + id);
          },
        });
        setSnackbarVisible(true);
        setTimeout(() => setSnackbarVisible(false), 3000); // Hide after 3 seconds
      })
      .catch(() => {
        setButtonState({
          text: 'RSVP for this event',
          loading: false,
          disabled: false,
          onClick: claimTicket,
        });
      });
  }, [id]);
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
          if (res.data.event.state == 'REGISTRATION_OPEN') {
            if (res.data.event.ma_ppt > 1) {
              setButtonState({
                text: res.data.event.Participant ? 'View Team' : 'Register',
                loading: false,
                disabled: false,
                onClick: () =>
                  res.data.event.Participant
                    ? navigate('/team-details/' + id)
                    : navigate('/team-register/' + id),
              });
            } else if (res.data.event.Participant) {
              setButtonState({
                text: 'Registered',
                loading: false,
                disabled: true,
                onClick: () => {},
              });
            } else {
              setButtonState({
                text: 'Register',
                loading: false,
                disabled: false,
                onClick: register,
              });
            }
          } else if (res.data.event.state == 'REGISTRATION_CLOSED') {
            if (res.data.event.Participant) {
              setButtonState({
                text: 'Already registered',
                loading: false,
                disabled: true,
                onClick: () => {},
              });
            } else {
              setButtonState({
                text: 'Registration Closed',
                loading: false,
                disabled: true,
                onClick: () => {},
              });
            }
          } else if (
            res.data.event.state == 'TICKET_OPEN' &&
            res.data.event.is_ticket_feature_enabled
          ) {
            if (res.data.event.Participant) {
              if (res.data.event.Participant.ticket_collected) {
                setButtonState({
                  text: 'View Ticket',
                  loading: false,
                  disabled: false,
                  onClick: () => {
                    navigate('/ticket/' + res.data.event.id);
                  },
                });
              } else if (
                res.data.event.tickets_sold >= res.data.event.ticket_count
              ) {
                setButtonState({
                  text: 'Tickets Sold Out',
                  loading: false,
                  disabled: true,
                  onClick: () => {},
                });
              } else {
                setButtonState({
                  text: 'RSVP for this event',
                  loading: false,
                  disabled: false,
                  onClick: claimTicket,
                });
              }
            } else {
              setButtonState({
                text: 'Not registered for this event',
                loading: false,
                disabled: true,
                onClick: () => {},
              });
            }
          } else if (
            res.data.event.state == 'TICKET_CLOSED' ||
            !res.data.event.is_ticket_feature_enabled
          ) {
            if (
              res.data.event.Participant &&
              res.data.event.Participant.ticket_collected
            ) {
              setButtonState({
                text: 'View Ticket',
                loading: false,
                disabled: false,
                onClick: () => {
                  navigate('/ticket/' + res.data.event.id);
                },
              });
            } else {
              setButtonState({
                text: 'RSVP closed',
                loading: false,
                disabled: true,
                onClick: () => {},
              });
            }
          } else if (res.data.event.state == 'UPCOMING') {
            setButtonState({
              text: 'Registrations Opening Soon',
              loading: false,
              disabled: true,
              onClick: () => {},
            });
          } else if (res.data.event.state == 'ONGOING') {
            if (res.data.event.registration_type == 'EXTERNAL') {
              setButtonState({
                text: 'Register',
                loading: false,
                disabled: false,
                onClick: () => {
                  window.location.href =
                    res.data.event.external_registration_link;
                },
              });
            } else if (res.data.event.start_in_event_activity) {
              setButtonState({
                text: 'Follow Activity',
                loading: false,
                disabled: false,
                onClick: () => {
                  window.location.href = res.data.event.in_event_activity;
                },
              });
            } else {
              setButtonState({
                text: 'Event is Ongoing',
                loading: false,
                disabled: true,
                onClick: () => {},
              });
            }
          } else if (res.data.event.state == 'COMPLETED') {
            setButtonState({
              text: 'Give Feedback',
              loading: false,
              disabled: false,
              onClick: () => {
                setIsFeedbackPopupOpen(true);
              },
            });
          }
        });
    };
    if (id) fetchEvent(id);
  }, [id, navigate, register]);

  if (loading && event == null) {
    return <Loader />;
  } else
    return (
      <>
        <div className="">
          <div
            className="w-screen aspect-square relative"
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
              <p className="font-fira text-foreground  text-2xl text-left">
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
                    event?.venue && event.venue.split(' ').length > 1
                      ? event.venue.slice(event.venue.indexOf(' '))
                      : ''
                  }
                />
                <IconText Icon={User} line1="500" line2="Participants" />
              </div>
              <hr className="border-1 border-mute" />
            </div>
            {event &&
              event.start_in_event_activity &&
              event.in_event_activity && (
                <Passage
                  title="Event Activity"
                  content={
                    <a
                      href={event?.in_event_activity}
                      className="text-blue-600"
                    >
                      {event.in_event_activity}
                    </a>
                  }
                />
              )}
            <Passage
              title="About the Event"
              content={event?.long_description || ''}
            />
            {/* event fee */}
            <Passage
              title="Fee"
              content={event?.fee === 0 ? 'Free' : `₹${event?.fee}`}
            />
          </div>

          <div className="fixed bottom-0 left-0 w-screen p-4 bg-background flex gap-4">
            <button
              className="w-full rounded-full bg-primary text-center flex flex-row items-center justify-center gap-2 h-12"
              disabled={buttonState.disabled}
              onClick={buttonState.onClick}
            >
              {buttonState.loading && <Spinner />}
              <h2 className="font-fira normal-case text-lg text-white">
                {buttonState.text}
              </h2>
            </button>
          </div>
        </div>
        {isFeedbackPopupOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsFeedbackPopupOpen(false);
              }
            }}
          >
            {event && (
              <FeedbackModal
                event_id={event.id}
                setIsFeedbackPopupOpen={setIsFeedbackPopupOpen}
              />
            )}
          </div>
        )}
        {snackbarVisible && (
          <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-96 bg-green-400 text-white p-4 rounded-md z-40 flex gap-4">
            <TickCircle size="24" color="#57585A" />
            Registration Successful!!
          </div>
        )}
      </>
    );
}
