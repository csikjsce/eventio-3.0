import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import UserDataContext from '../contexts/UserDataContext';
import EventsDataContext from '../contexts/EventsDataContext';

// DEV BYPASS: auth disabled for local development
const DEV_USER: User = {
  id: 1,
  name: 'Dev User',
  email: 'dev@example.com',
  role: 'COUNCIL',
  degree: 'B.Tech',
  branch: 'Computer Engineering',
  gender: 'Male',
  interests: [],
  phone_number: 0,
  photo_url: '',
  roll_number: 0,
  year: 1,
  about: '',
  college: 'KJ Somaiya',
  is_somaiya_student: true,
};

const makeEvent = (overrides: Partial<EventData>): EventData => ({
  id: 0,
  name: '',
  tag_line: '',
  description: '',
  long_description: '',
  event_type: 'Competition',
  state: 'DRAFT',
  state_history: [],
  dates: [new Date()],
  venue: '',
  fee: 0,
  tags: [],
  organizer_id: 1,
  organizer: { name: 'Dev User', photo_url: '', id: 1, email: 'dev@example.com' },
  banner_url: '',
  event_page_image_url: '',
  logo_image__url: '',
  is_feedback_enabled: false,
  is_only_somaiya: true,
  is_ticket_feature_enabled: false,
  ma_ppt: 1,
  min_ppt: 1,
  parent_id: null,
  children: [],
  registration_type: 'ONPLATFORM',
  attendance_type: null,
  external_registration_link: null,
  online_event_link: null,
  ticket_count: 0,
  tickets_sold: 0,
  report_url: '',
  urls: {},
  Participant: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

const MOCK_EVENTS: Events = {
  DRAFT: [
    makeEvent({
      id: 10,
      name: 'Workshop: UI/UX Design Fundamentals',
      tag_line: 'Design like a pro, ship like an engineer',
      description: 'A beginner-friendly workshop on modern UI/UX design principles using Figma.',
      event_type: 'Workshop',
      state: 'DRAFT',
      dates: [new Date('2026-07-20T10:00:00')],
      venue: 'Design Lab, KJSCE',
      fee: 0,
      tags: ['Design', 'Tech'],
      logo_image__url: 'https://picsum.photos/seed/uiux-logo/200/200',
      event_page_image_url: 'https://picsum.photos/seed/uiux-page/400/400',
    }),
  ],
  APPLIED_FOR_APPROVAL: [],
  UNLISTED: [],
  UPCOMING: [
    makeEvent({
      id: 2,
      name: 'AI Summit 2026',
      tag_line: 'Explore the frontiers of artificial intelligence',
      description: 'A full-day summit featuring talks from AI researchers and industry leaders.',
      event_type: 'Seminar',
      state: 'UPCOMING',
      dates: [new Date('2026-06-28T09:00:00')],
      venue: 'KJSCE Auditorium, Mumbai',
      fee: 150,
      tags: ['Tech', 'AI'],
      is_ticket_feature_enabled: true,
      ticket_count: 500,
      tickets_sold: 342,
      logo_image__url: 'https://picsum.photos/seed/ai-logo/200/200',
      event_page_image_url: 'https://picsum.photos/seed/ai-page/400/400',
    }),
    makeEvent({
      id: 6,
      name: 'Cybersecurity CTF Challenge',
      tag_line: 'Hunt the flag, own the game',
      description: 'A competitive capture-the-flag cybersecurity contest open to all students.',
      event_type: 'Competition',
      state: 'UPCOMING',
      dates: [new Date('2026-07-10T11:00:00')],
      venue: 'Server Lab, KJSCE',
      fee: 50,
      tags: ['Tech', 'Security'],
      logo_image__url: 'https://picsum.photos/seed/ctf-logo/200/200',
      event_page_image_url: 'https://picsum.photos/seed/ctf-page/400/400',
    }),
  ],
  REGISTRATION_OPEN: [
    makeEvent({
      id: 1,
      name: 'TechFest 2026',
      tag_line: 'The biggest tech celebration of the year',
      description: 'A grand technology festival featuring hackathons, workshops, and keynote sessions.',
      event_type: 'Competition',
      state: 'REGISTRATION_OPEN',
      dates: [
        new Date('2026-06-15T09:00:00'),
        new Date('2026-06-16T09:00:00'),
      ],
      venue: 'KJSCE Campus, Mumbai',
      fee: 200,
      tags: ['Tech', 'Competition'],
      ma_ppt: 4,
      min_ppt: 2,
      logo_image__url: 'https://picsum.photos/seed/techfest-logo/200/200',
      event_page_image_url: 'https://picsum.photos/seed/techfest-page/400/400',
    }),
    makeEvent({
      id: 3,
      name: 'Code Rush — 24H Hackathon',
      tag_line: '24 hours of pure coding madness',
      description: 'An intense 24-hour hackathon for developers of all skill levels.',
      event_type: 'Hackathon',
      state: 'REGISTRATION_OPEN',
      dates: [new Date('2026-07-05T08:00:00')],
      venue: 'Computer Lab Wing B, KJSCE',
      fee: 100,
      tags: ['Tech', 'Hackathon'],
      ma_ppt: 5,
      min_ppt: 2,
      logo_image__url: 'https://picsum.photos/seed/coderush-logo/200/200',
      event_page_image_url: 'https://picsum.photos/seed/coderush-page/400/400',
    }),
  ],
  REGISTRATION_CLOSED: [],
  TICKET_OPEN: [],
  TICKET_CLOSED: [],
  ONGOING: [
    makeEvent({
      id: 4,
      name: 'Cloud Computing Bootcamp',
      tag_line: 'Deploy, scale, and manage in the cloud',
      description: 'A 3-day intensive bootcamp on AWS, Azure, and GCP fundamentals.',
      event_type: 'Workshop',
      state: 'ONGOING',
      dates: [
        new Date('2026-05-01T09:00:00'),
        new Date('2026-05-02T09:00:00'),
        new Date('2026-05-03T09:00:00'),
      ],
      venue: 'Seminar Hall 2, KJSCE',
      fee: 300,
      logo_image__url: 'https://picsum.photos/seed/cloud-logo/200/200',
      event_page_image_url: 'https://picsum.photos/seed/cloud-page/400/400',
      tags: ['Tech', 'Cloud'],
    }),
  ],
  COMPLETED: [
    makeEvent({
      id: 5,
      name: 'DevTalk: Open Source Culture',
      tag_line: 'The power of open collaboration',
      description: 'A developer talk series on open-source contributions and career growth.',
      event_type: 'Talk',
      state: 'COMPLETED',
      dates: [new Date('2026-03-10T14:00:00')],
      venue: 'Seminar Hall 1, KJSCE',
      fee: 0,
      is_only_somaiya: false,
      tags: ['Tech', 'Open Source'],
      logo_image__url: 'https://picsum.photos/seed/devtalk-logo/200/200',
      event_page_image_url: 'https://picsum.photos/seed/devtalk-page/400/400',
    }),
  ],
  PRIVATE: [],
};

export default function Protected() {
  const [userData, setUserData] = useState<User | null>(DEV_USER);
  const [eventsData, setEventsData] = useState<Events | null>(MOCK_EVENTS);

  const eventsList = [
    ...(eventsData?.DRAFT || []),
    ...(eventsData?.APPLIED_FOR_APPROVAL || []),
    ...(eventsData?.UNLISTED || []),
    ...(eventsData?.UPCOMING || []),
    ...(eventsData?.REGISTRATION_OPEN || []),
    ...(eventsData?.REGISTRATION_CLOSED || []),
    ...(eventsData?.TICKET_OPEN || []),
    ...(eventsData?.TICKET_CLOSED || []),
    ...(eventsData?.ONGOING || []),
    ...(eventsData?.COMPLETED || []),
    ...(eventsData?.PRIVATE || []),
  ];

  const refreshEventsData = async () => {
    // DEV BYPASS: no-op when auth is disabled
  };
  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      <EventsDataContext.Provider
        value={{ eventsData, setEventsData, eventsList, refreshEventsData }}
      >
        <Outlet />
      </EventsDataContext.Provider>
    </UserDataContext.Provider>
  );
}
