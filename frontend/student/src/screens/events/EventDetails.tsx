import eventpic from '../../assets/eventdetails.png';
import { Button } from '@material-tailwind/react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft,
  Send2,
  CalendarAdd,
  Calendar2,
  Location,
  User,
  Icon as IconType,
} from 'iconsax-react';

const event: {
  name: string;
  council: string;
  image: string;
  councilImage: string;
  date: Date;
  location: string;
  tags: string[];
  shortDesc: string;
  status: string;
  about: string;
  speakers: { img: string; name: string; subtext1: string; subtext2: string }[];
  takeaways: string;
  sponsors: { img: string; name: string; subtext1: string }[];
  rewards: string;
  contact: { name: string; position: string; phone: string }[];
} = {
  name: 'Road To Programming',
  council: 'CSI KJSCE',
  image: eventpic,
  councilImage: eventpic,
  date: new Date(1724758200000),
  location: 'Auditorium A Building',
  tags: ['Tech', 'Registered'],
  shortDesc: 'Short Description',
  status: 'Live',
  about:
    'Road to Programming is an educational event guiding participants on a concise journey through the fundamentals and pathways of programming, offering insights into coding concepts and career possibilities.',
  speakers: [
    {
      img: eventpic,
      name: 'Ameya Yeole',
      subtext1: 'Third Year IT',
      subtext2: 'Tutor @ Coding Ninjas',
    },
    {
      img: eventpic,
      name: 'Naman Sachatee',
      subtext1: 'Second Year IT',
      subtext2: 'Ops Team Member @ CSI KJSCE',
    },
    {
      img: eventpic,
      name: 'Ritvik Jindal',
      subtext1: 'Third Year Comps',
      subtext2: 'Tech Head @ CSI KJSCE',
    },
  ],
  takeaways:
    'Prizes, Fundamental Programming Understanding, Real-World Application and Career Pathways, Structured Learning Roadmap',
  sponsors: [
    { img: eventpic, name: 'Canva', subtext1: 'Design Partner' },
    { img: eventpic, name: 'Balaji Wafer', subtext1: 'Snack Partner' },
    { img: eventpic, name: 'Red Bull', subtext1: 'Drinks Partner' },
    { img: eventpic, name: 'McLaren', subtext1: 'Sports Partner' },
  ],
  rewards:
    'Engage in domain-specific quizzes and seize your chance to shine. Be among the Top 5 scorers in each domain to win rewards, and you can claim your spot in the elite by securing a place among the overall Top 5 contestants along with getting rewards.',
  contact: [
    { name: 'Eshan Trivedi', position: '(Gen Sec)', phone: '+91 7788991122' },
    { name: 'Ritvik Jindal', position: '(Tech Head)', phone: '+91 9988776655' },
  ],
};

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
      <p className="font-fira text-gray-1 text-sm mt-2">{line1}</p>
      <p className="font-fira text-gray-1 text-sm">{line2}</p>
    </div>
  );
}

function Passage({ title, content }: { title: string; content: string }) {
  return (
    <div className="flex flex-col gap-2 items-start text-left">
      <p className="font-fira text-foreground-light dark:text-foreground-dark text-lg">
        {title}
      </p>
      <p className="font-fira text-gray-1 dark:text-foreground-dark text-xs">
        {content}
      </p>
    </div>
  );
}

export default function EventDetails() {
  const dateString = event.date.toDateString().slice(0, -5); // Remove year
  const timeString = event.date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const [loading, setLoading] = useState(false);
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  return (
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
            {dateString} at {timeString}
          </p>
        </div>
        <div className="h-28 flex flex-col justify-between">
          <hr className="border-1 border-gray-1" />
          <div className="flex flex-row justify-between">
            <IconText Icon={Calendar2} line1={dateString} line2={timeString} />
            <IconText
              Icon={Location}
              line1={event.location.split(' ')[0]}
              line2={event.location.slice(event.location.indexOf(' '))}
            />
            <IconText Icon={User} line1="100" line2="Participants" />
          </div>
          <hr className="border-1 border-gray-1" />
        </div>
        <Passage title="About the Event" content={event.about} />

        <div className="flex flex-col gap-2 items-start text-left">
          <p className="font-fira text-foreground-light dark:text-foreground-dark text-lg">
            Notable Speakers
          </p>
          <div className="flex flex-col gap-3">
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
          </div>
        </div>

        <Passage title="Key Takeaways" content={event.takeaways} />

        <div className="flex flex-col gap-2 items-start text-left">
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
        </div>

        <Passage title="Rewards" content={event.rewards} />

        <div className="flex flex-col gap-1 items-start text-left">
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
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-screen p-4 bg-background-light dark:bg-background-dark">
        {/* TODO: Center align while loading */}
        <Button
          className="rounded-full bg-primary text-center"
          onClick={async () => {
            setLoading(true);
            await delay(1000);
            setLoading(false);
          }}
          loading={loading}
          fullWidth
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <p className="font-fira normal-case text-lg">Register</p>
        </Button>
      </div>
    </div>
  );
}
