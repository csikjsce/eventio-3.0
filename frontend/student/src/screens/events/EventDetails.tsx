import { Button } from '@material-tailwind/react';
import axios from 'axios';
import {
  ArrowLeft,
  Calendar2,
  CalendarAdd,
  Location,
  Send2,
  User,
} from 'iconsax-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import IconText from '../../components/IconText';
import Loader from '../../components/Loader';
import Passage from '../../components/Passage';

export default function EventDetails() {
  const [event, setEvent] = useState<{
    name: string;
    organizer: string;
    image: string;
    banner_url: string;
    date: Date;
    venue: string;
    tags: string[];
    description: string;
    
    long_description: string;
    speakers: {
      img: string;
      name: string;
      subtext1: string;
      subtext2: string;
    }[];
    takeaways: string;
    sponsors: { img: string; name: string; subtext1: string }[];
    rewards: string;
    contact: { name: string; position: string; phone: string }[];
  }>({
    name: '',
    organizer: '',
    image: '',
    banner_url: '',
    date: new Date(),
    venue: '',
    tags: [],
    description: '',  
    
    long_description: '',
    speakers: [],
    takeaways: '',
    sponsors: [],
    rewards: '',
    contact: [],
  });

  const [loading, setLoading] = useState(true);

  const { id } = useParams();
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
          console.log(res.data);
          setEvent(res.data);
          setLoading(false);
        });
    };
    if (id) fetchEvent(id);
  }, [id]);
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="absolute top-0 left-0">
          <div
            className="w-screen aspect-square relative"
            style={{ backgroundImage: event.image }}
          >
            <img
              src={event.image}
              alt="Event Details"
              className="w-screen aspect-square object-cover"
            />
            <Link
              to=".."
              className="absolute top-0 left-0 mt-6 ml-6 h-11 w-11 bg-background-light dark:bg-background-dark rounded-full shadow-sm shadow-primary flex items-center justify-center"
            >
              <ArrowLeft size={24} color="#B61F2D" />
            </Link>
            <div className="absolute -bottom-5 right-0 flex justify-end gap-3 mr-6">
              <Send2
                size={24}
                color="#fff"
                variant="Bold"
                className="bg-primary h-11 w-11 rounded-full pt-2 pr-2 pl-1.5 pb-1.5 hover:cursor-pointer"
              />
              <CalendarAdd
                size={24}
                color="#fff"
                variant="Bold"
                className="bg-primary h-11 w-11 rounded-full p-2 hover:cursor-pointer"
              />
            </div>
          </div>
          <div className="flex flex-col p-8 gap-8 mb-20 text-foreground-dark dark:text-background-dark">
            <div className="flex flex-col gap-1.5 items-start">
              <p className="font-fira text-foreground-light dark:text-foreground-dark text-2xl text-left">
                {event.name}
              </p>
              <p className="font-fira text-gray-1 text-sm">
                {event?.date?.toDateString().slice(0, -5)} at{' '}
                {event?.date?.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="h-28 flex flex-col justify-between">
              <hr className="border-1 border-gray-1" />
              <div className="flex flex-row justify-between">
  <IconText
    Icon={Calendar2}
    line1={event?.date?.toDateString().slice(0, -5)}
    line2={event?.date?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })}
  />
  <IconText
    Icon={Location}
    line1={event.venue ? event.venue.split(' ')[0] : 'Location not specified'}
    line2={event.venue ? event.venue.slice(event.venue.indexOf(' ')) : ''}
  />
  <IconText Icon={User} line1="100" line2="Participants" />
</div>
              <hr className="border-1 border-gray-1" />
            </div>
            <Passage title="About the Event" content={event.long_description} />

            <div className="flex flex-col gap-2 items-start text-left">
              <p className="font-fira text-foreground-light dark:text-foreground-dark text-lg">
                Notable Speakers
              </p>
              {/* <div className="flex flex-col gap-3">
                {event.speakers.map((speaker) => (
                  <div className="flex flex-row gap-3 items-center">
                    <img
                      src={speaker.img}
                      alt="Speaker"
                      className="h-12 w-12 rounded-full outline outline-1 outline-primary"
                    />
                    <div className="flex flex-col gap-1.5">
                      <p className="font-fira text-gray-1 dark:text-foreground-dark text-xs">
                        <strong className="text-foreground-light dark:text-foreground-dark text-sm">
                          {speaker.name}
                        </strong>{' '}
                        {speaker.subtext1}
                      </p>
                      <p className="font-fira text-gray-1 dark:text-foreground-dark text-xs">
                        {speaker.subtext2}
                      </p>
                    </div>
                  </div>
                ))}
              </div> */}
            </div>

            <Passage title="Key Takeaways" content={event.takeaways} />

            {/* <div className="flex flex-col gap-2 items-start text-left">
              <p className="font-fira text-foreground-light dark:text-foreground-dark text-lg">
                Sponsors
              </p>
              <div className="grid grid-cols-2 gap-2 w-full">
                {event.sponsors.map((sponsor) => (
                  <div className="flex flex-row gap-3">
                    <img
                      src={sponsor.img}
                      alt="Sponsor"
                      className="h-12 w-12 rounded-full outline outline-1 outline-primary"
                    />
                    <div className="flex flex-col gap-0.5 justify-center">
                      <p className="font-fira text-gray-1 dark:text-foreground-dark text-xs">
                        <strong className="text-foreground-light dark:text-foreground-dark text-sm">
                          {sponsor.name}
                        </strong>
                      </p>
                      <p className="font-fira text-gray-1 dark:text-foreground-dark text-xs">
                        {sponsor.subtext1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            <Passage title="Rewards" content={event.rewards} />

            {/* <div className="flex flex-col gap-1 items-start text-left">
              <p className="font-fira text-foreground-light dark:text-foreground-dark text-lg">
                Contact
              </p>
              <p className="font-fira text-gray-1 dark:text-foreground-dark text-xs">
                Reach out to us for further queries
              </p>
              <div className="flex flex-col">
                {event.contact.map((contact) => (
                  <div className="flex flex-col gap-1.5">
                    <p className="font-fira text-gray-1 dark:text-foreground-dark text-xs">
                      <strong className="text-foreground-light dark:text-foreground-dark text-sm">
                        {contact.name}
                      </strong>{' '}
                      {contact.position}: {contact.phone}
                    </p>
                  </div>
                ))}
              </div>
            </div> */}
          </div>

          <div className="fixed bottom-0 left-0 w-screen p-4 bg-background-light dark:bg-background-dark">
            {/* TODO: Center align while loading */}
            <Button
              className="rounded-full bg-primary text-center"
              fullWidth
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              <p className="font-fira normal-case text-lg">Register</p>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
