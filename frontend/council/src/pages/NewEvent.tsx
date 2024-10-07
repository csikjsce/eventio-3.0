import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { NewEventSchema, newEventSchema } from '../utils/validation';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Spinner from '../components/Spinner';
import Loader from '../components/Loader';
import { useNavigate, useParams } from 'react-router-dom';
import UserDataContext from '../contexts/UserDataContext';
import EventsDataContext from '../contexts/EventsDataContext';

function GayNigga({
  isMultipleDays,
  endDate,
  setEndDate,
  errors,
}: {
  isMultipleDays: boolean;
  endDate: string;
  setEndDate: (date: string) => void;
  errors: any;
}) {
  if (isMultipleDays) {
    return (
      <div>
        <label className="block text-foreground">End Date</label>
        <input
          type="datetime-local"
          className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
          onChange={(e) => {
            setEndDate(e.target.value);
          }}
          value={endDate}
        />
        <p className="text-red-500">{errors.dates?.message}</p>
      </div>
    );
  }
  return <></>;
}

function dateToString(date: Date) {
  const formattedDate = date.toLocaleString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24-hour format
  });

  const formattedOutput = formattedDate.replace(', ', 'T').slice(0, 16);
  return formattedOutput;
}

export default function NewEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState<NewEventSchema | null>(null);

  const { userData } = useContext(UserDataContext);
  const { refreshEventsData } = useContext(EventsDataContext);

  const methods = useForm<NewEventSchema>({
    resolver: yupResolver(newEventSchema),
    defaultValues: {
      fee: 0,
      is_ticket_feature_enabled: true,
      ma_ppt: 1,
      min_ppt: 1,
      is_feedback_enabled: false,
      is_only_somaiya: true,
      registration_type: 'ONPLATFORM',
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  // States for date inputs
  const [startDate, setStartDate] = useState<string>(dateToString(new Date()));
  const [endDate, setEndDate] = useState<string>(dateToString(new Date()));
  const [isMultipleDates, setIsMultipleDates] = useState(false);
  const [isTeamEvent, setIsTeamEvent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [success, setSuccess] = useState(false);

  const eventState = watch('state');

  useEffect(() => {
    if (id) {
      axios
        .request({
          baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
          url: '/api/v1' + `/event/p/get/${id}`,
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
          },
        })
        .then((response) => {
          if (
            !response.data.event.organizer_id ||
            !userData?.id ||
            response.data.event.organizer_id !== parseInt(userData?.id)
          ) {
            navigate('/');
          }
          setEvent(response.data.event);
          methods.reset(response.data.event);
          setStartDate(dateToString(new Date(response.data.event.dates[0])));
          if (response.data.event.dates.length > 1) {
            setEndDate(
              dateToString(
                new Date(
                  response.data.event.dates[
                    response.data.event.dates.length - 1
                  ],
                ),
              ),
            );
            setIsMultipleDates(true);
          }
          if (response.data.event.ma_ppt > 1) {
            setIsTeamEvent(true);
          } else {
            setValue('ma_ppt', 1);
            setValue('min_ppt', 1);
          }
          setValue(
            'is_ticket_feature_enabled',
            response.data.event.is_ticket_feature_enabled,
          );
        });
    }
  }, [id]);

  function getDates(start: Date | null, end: Date | null) {
    const dateArray: Date[] = [];
    if (start === null || end === null) {
      return dateArray;
    }
    const currentDate = start;
    while (currentDate <= end) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    dateArray.push(end);
    return dateArray;
  }

  useEffect(() => {
    if (!isMultipleDates) {
      setValue('dates', [new Date(startDate)]);
      return;
    }
    const dates = getDates(new Date(startDate), new Date(endDate));
    setValue('dates', dates);
  }, [startDate, endDate, isMultipleDates]);

  useEffect(() => {
    if (!isTeamEvent) {
      setValue('ma_ppt', 1);
      setValue('min_ppt', 1);
      return;
    }
  }, [isTeamEvent]);

  const onSubmit = async (data: NewEventSchema) => {
    data.logo_image_url = data.event_page_image_url;
    console.log(data);
    try {
      setLoading(true);
      const endpoint = id ? `/event/p/update/${id}` : '/event/p/create';
      const response = await axios.post(
        import.meta.env.VITE_APP_SERVER_ADDRESS + '/api/v1' + endpoint,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );
      console.log(response.data);
      setSuccess(true);
      refreshEventsData();
    } catch (error) {
      console.error(error);
      setSuccess(false);
    }
    setLoading(false);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      navigate('/');
    }, 2000);
  };

  const eventType = watch('event_type');
  const isExternal = watch('registration_type') === 'EXTERNAL';

  if (id && !event) {
    return <Loader />;
  }

  return (
    <FormProvider {...methods}>
      <div className="p-8 w-full relative">
        <p className="text-2xl font-fira text-foreground mb-4">New Event</p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-6"
        >
          {/* Name */}
          <div>
            <label className="block text-foreground">Event Name</label>
            <input
              className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
              {...register('name')}
              placeholder="Enter event name"
            />
            <p className="text-red-500">{errors.name?.message}</p>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-foreground">Tagline</label>
            <input
              className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
              {...register('tag_line')}
              placeholder="Some Catchy Phrase"
            />
            <p className="text-red-500">{errors.tag_line?.message}</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-foreground">Description</label>
            <textarea
              className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
              {...register('description')}
              placeholder="Enter event description"
            />
            <p className="text-red-500">{errors.description?.message}</p>
          </div>

          {/* Long Description */}
          <div>
            <label className="block text-foreground">Long Description</label>
            <textarea
              className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
              {...register('long_description')}
              placeholder="Long description"
            />
            <p className="text-red-500">{errors.long_description?.message}</p>
          </div>

          {/* Date Picker (Single or Range) */}

          <div>
            <label className="block text-foreground">
              {isMultipleDates ? 'Start Date' : 'Event Date'}
            </label>
            <input
              type="datetime-local"
              className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
              onChange={(e) => {
                setStartDate(e.target.value);
              }}
              // value={startDate?.toISOString().slice(0, 16)}
              // defaultValue={startDate?.toLocaleString().slice(0, 16)}
              value={startDate}
            />
          </div>

          {/* End Date (Only if multiple dates are allowed) */}
          {isMultipleDates ? (
            <div>
              <label className="block text-foreground">End Date</label>
              <input
                type="datetime-local"
                className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                onChange={(e) => {
                  setEndDate(e.target.value);
                }}
                value={endDate}
              />
              <p className="text-red-500">{errors.dates?.message}</p>
            </div>
          ) : (
            <></>
          )}

          {/* Checkbox for multiple dates */}
          <div className="col-span-2 select-none">
            <label className="text-foreground max-w-56 flex items-center gap-2 select-none hover:cursor-pointer">
              <input
                type="checkbox"
                onChange={() => setIsMultipleDates(!isMultipleDates)}
                checked={isMultipleDates}
              />
              This is a multi-day event
            </label>
            <p className="text-red-500">
              {errors.dates &&
                errors.dates.map &&
                errors.dates.map((error) => error?.message || '')}
            </p>
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-foreground">Event Type</label>
            <select
              className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
              {...register('event_type')}
            >
              <option value="COMPETETION">Competition</option>
              <option value="WORKSHOP">Workshop</option>
              <option value="SPEAKER_SESSION">Speaker Session</option>
              <option value="ONLINE">Online</option>
              <option value="FEST">Fest</option>
            </select>
            <p className="text-red-500">{errors.event_type?.message}</p>
          </div>

          {/* Venue/Online Link */}
          <div>
            <label className="block text-foreground">
              {eventType === 'ONLINE' ? 'Online Event Link' : 'Venue'}
            </label>
            <input
              className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
              {...register(
                eventType === 'ONLINE' ? 'online_event_link' : 'venue',
              )}
              placeholder={
                eventType === 'ONLINE'
                  ? 'Enter online event link'
                  : 'Enter event venue'
              }
            />
            <p className="text-red-500">
              {eventType === 'ONLINE'
                ? errors.online_event_link?.message
                : errors.venue?.message}
            </p>
          </div>

          {/* Event Page Image URL */}
          <div>
            <label className="block text-foreground">
              Events Page Image URL
            </label>
            <input
              className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
              {...register('event_page_image_url')}
              placeholder="Enter image URL"
            />
            <p className="text-red-500">
              {errors.event_page_image_url?.message}
            </p>
          </div>

          {/* Banner Image URL */}
          <div>
            <label className="block text-foreground">Banner Image URL</label>
            <input
              className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
              {...register('banner_url')}
              placeholder="Enter image URL"
            />
            <p className="text-red-500">{errors.banner_url?.message}</p>
          </div>

          {/* Checkbox for team event */}
          <div className="col-span-2">
            <label className="text-foreground max-w-44 flex items-center gap-2 select-none hover:cursor-pointer">
              <input
                type="checkbox"
                onChange={() => setIsTeamEvent(!isTeamEvent)}
              />
              Is this a team event?
            </label>
          </div>

          {isTeamEvent && (
            <>
              <div>
                <label className="block text-foreground">
                  Maximum Particiapants per Team
                </label>
                <input
                  className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                  {...register('ma_ppt')}
                  placeholder="Maximum Participants per Team"
                />
                <p className="text-red-500">{errors.ma_ppt?.message}</p>
              </div>
              <div>
                <label className="block text-foreground">
                  Minimum Particiapants per Team
                </label>
                <input
                  className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                  {...register('min_ppt')}
                  placeholder="Minimum Participants per Team"
                />
                <p className="text-red-500">{errors.min_ppt?.message}</p>
              </div>
            </>
          )}

          {/* Fee */}
          <div>
            <label className="block text-foreground">Fee</label>
            <input
              className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
              {...register('fee')}
              placeholder="Enter event fee"
            />
            <p className="text-red-500">{errors.fee?.message}</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-foreground">Tags</label>
            <input
              className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
              {...register('tags')}
              placeholder="Tech, Coding, Fun"
            />
            <p className="text-red-500">{errors.tags?.message}</p>
          </div>

          {/* Checkbox for feedback */}
          <div>
            <label className="text-foreground flex items-center gap-2 select-none hover:cursor-pointer">
              <input type="checkbox" {...register('is_feedback_enabled')} />
              Enable Feedback
            </label>
          </div>

          {/* Checkbox for somaiya only */}
          <div>
            <label className="text-foreground flex items-center gap-2 select-none hover:cursor-pointer">
              <input type="checkbox" {...register('is_only_somaiya')} />
              This a Somaiya-only Event
            </label>
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-foreground">Registration Type</label>
            <select
              className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
              {...register('registration_type')}
            >
              <option value="ONPLATFORM">On-Platform</option>
              <option value="EXTERNAL">External</option>
            </select>
            <p className="text-red-500">{errors.registration_type?.message}</p>
          </div>

          {/* External Registration Link */}
          {isExternal ? (
            <div>
              <label className="block text-foreground">
                External Registration Link
              </label>
              <input
                className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                {...register('external_registration_link')}
                placeholder="Enter external registration link"
              />
              <p className="text-red-500">
                {errors.external_registration_link?.message}
              </p>
            </div>
          ) : (
            <div>
              {/* Checkbox for feedback */}
              <label className="text-foreground flex items-center h-full gap-2 select-none hover:cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_ticket_feature_enabled')}
                />
                Enable Tickets
              </label>
              <p className="text-red-500">
                {errors.is_ticket_feature_enabled?.message}
              </p>
            </div>
          )}

          {/* In-Event Activity */}
          <div>
            <label className="block text-foreground">In-Event Activity</label>
            <input
              className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
              {...register('in_event_activity')}
              placeholder="In event activity link"
            />
            <p className="text-red-500">{errors.in_event_activity?.message}</p>
          </div>

          {/* Checkbox for start in-event activity */}
          <div>
            <label className="text-foreground flex items-center h-full gap-2 select-none hover:cursor-pointer">
              <input type="checkbox" {...register('start_in_event_activity')} />
              Start In-Event Activity
            </label>
            <p className="text-red-500">
              {errors.start_in_event_activity?.message}
            </p>
          </div>

          {/* State */}
          {event && (
            <div>
              <label className="block text-foreground">Status</label>
              <select
                className="border border-mute p-2 w-full bg-background text-foreground rounded-md"
                {...register('state')}
              >
                {/* Render options based on current value */}
                {eventState === 'DRAFT' ||
                eventState === 'APPLIED_FOR_APPROVAL' ? (
                  <>
                    <option value="DRAFT">Draft</option>
                    <option value="APPLIED_FOR_APPROVAL">
                      Applied for Approval
                    </option>
                  </>
                ) : (
                  <>
                    <option value="UNLISTED">Unlisted</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="REGISTRATION_OPEN">Registration Open</option>
                    <option value="REGISTRATION_CLOSED">
                      Registration Closed
                    </option>
                    <option value="TICKET_OPEN">Ticket Open</option>
                    <option value="TICKET_CLOSED">Ticket Closed</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PRIVATE">Private</option>
                  </>
                )}
              </select>
              <p className="text-red-500">{errors.state?.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`text-white px-4 py-2 rounded-md col-span-2 flex items-center justify-center ${loading ? 'bg-primary/50 disabled:' : 'bg-primary'}`}
          >
            {loading ? <Spinner /> : event ? 'Update Event' : 'Create Event'}
          </button>
        </form>
        {showAlert && (
          <div
            className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 translate-y-5 w-96 p-2 rounded-md text-center ${success ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}
          >
            {success
              ? event
                ? 'Event updated successfully!'
                : 'Event created successfully!'
              : 'Failed to create event!'}
          </div>
        )}
        {/* {JSON.stringify(errors)} */}
      </div>
    </FormProvider>
  );
}
