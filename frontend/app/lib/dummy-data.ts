import type { EventData, Events, User } from "@/types/eventio";

const d = (offsetDays: number, hour = 10) =>
  new Date(2026, 4, 24 + offsetDays, hour, 0, 0);

/* ─── Council entities ─── */
export type Council = User & {
  about: string;
  banner_url: string;
  instagram?: string;
  website?: string;
  tagline: string;
};

export const councilList: Council[] = [
  {
    id: 1,
    name: "Cultural Council",
    email: "cultural.council@somaiya.edu",
    role: "COUNCIL",
    degree: "",
    branch: "",
    gender: "",
    interests: ["Cultural", "Fest", "Dance", "Music"],
    phone_number: 9123456701,
    photo_url: "https://i.pravatar.cc/150?u=cultural_council",
    roll_number: 0,
    year: 0,
    about:
      "The Cultural Council at KJSCE drives the vibrant arts and culture scene on campus — from annual fests to spontaneous open-mics, dance battles, and drama nights.",
    tagline: "Where creativity meets campus life",
    banner_url: "https://picsum.photos/seed/cultural_banner/800/400",
    college: "KJSCE",
    is_somaiya_student: false,
    instagram: "kjsce_cultural",
    website: "https://kjsce.somaiya.edu",
  },
  {
    id: 2,
    name: "Music Council",
    email: "music.council@somaiya.edu",
    role: "COUNCIL",
    degree: "",
    branch: "",
    gender: "",
    interests: ["Music", "Band", "Acoustic"],
    phone_number: 9123456702,
    photo_url: "https://i.pravatar.cc/150?u=music_council",
    roll_number: 0,
    year: 0,
    about:
      "From intimate acoustic sessions to full-blown Battle of Bands nights, the Music Council keeps the campus humming year-round.",
    tagline: "Feel the rhythm, own the stage",
    banner_url: "https://picsum.photos/seed/music_banner/800/400",
    college: "KJSCE",
    is_somaiya_student: false,
    instagram: "kjsce_music",
  },
  {
    id: 3,
    name: "Tech Council",
    email: "tech.council@somaiya.edu",
    role: "COUNCIL",
    degree: "",
    branch: "",
    gender: "",
    interests: ["Tech", "Hackathon", "Coding", "AI"],
    phone_number: 9123456703,
    photo_url: "https://i.pravatar.cc/150?u=tech_council",
    roll_number: 0,
    year: 0,
    about:
      "The Tech Council powers every hackathon, coding challenge, AI workshop, and robotics showcase at KJSCE — turning ideas into innovations.",
    tagline: "Build, break, repeat",
    banner_url: "https://picsum.photos/seed/tech_banner/800/400",
    college: "KJSCE",
    is_somaiya_student: false,
    instagram: "kjsce_tech",
    website: "https://kjsce.somaiya.edu/tech",
  },
  {
    id: 4,
    name: "E-Cell",
    email: "ecell@somaiya.edu",
    role: "COUNCIL",
    degree: "",
    branch: "",
    gender: "",
    interests: ["Entrepreneurship", "Startup", "Finance"],
    phone_number: 9123456704,
    photo_url: "https://i.pravatar.cc/150?u=ecell_council",
    roll_number: 0,
    year: 0,
    about:
      "E-Cell fosters the entrepreneurial spirit on campus through pitch nights, startup bootcamps, investor talks, and incubation support.",
    tagline: "Dream it. Build it. Scale it.",
    banner_url: "https://picsum.photos/seed/ecell_banner/800/400",
    college: "KJSCE",
    is_somaiya_student: false,
    instagram: "kjsce_ecell",
  },
  {
    id: 5,
    name: "Sports Council",
    email: "sports.council@somaiya.edu",
    role: "COUNCIL",
    degree: "",
    branch: "",
    gender: "",
    interests: ["Sports", "Cricket", "Football", "Athletics"],
    phone_number: 9123456705,
    photo_url: "https://i.pravatar.cc/150?u=sports_council",
    roll_number: 0,
    year: 0,
    about:
      "The Sports Council organises inter-college tournaments, intra-college leagues, and fitness events that keep the campus competitive and active.",
    tagline: "Play hard, win harder",
    banner_url: "https://picsum.photos/seed/sports_banner/800/400",
    college: "KJSCE",
    is_somaiya_student: false,
    instagram: "kjsce_sports",
  },
];

const council = (id: number, name: string) => ({
  id,
  name,
  email: `${name.toLowerCase().replace(/\s/g, ".")}@somaiya.edu`,
  photo_url: `https://i.pravatar.cc/150?u=${name.toLowerCase().replace(/\s/g, "_")}_council`,
});

const baseEvent = (
  partial: Partial<EventData> & Pick<EventData, "id" | "name" | "state">,
): EventData => ({
  attendance_type: null,
  banner_url: `https://picsum.photos/seed/banner${partial.id}/800/400`,
  created_at: d(-30).toISOString(),
  dates: [d(7)],
  description: partial.description ?? "An exciting campus event.",
  event_page_image_url: `https://picsum.photos/seed/event${partial.id}/600/600`,
  event_type: "CULTURAL",
  external_registration_link: null,
  fee: 0,
  is_feedback_enabled: true,
  is_only_somaiya: true,
  is_ticket_feature_enabled: true,
  logo_image__url: `https://picsum.photos/seed/logo${partial.id}/200/200`,
  long_description:
    partial.long_description ??
    "Join us for an unforgettable experience filled with learning, networking, and fun. Open to all KJSCE students.",
  ma_ppt: 1,
  min_ppt: 1,
  online_event_link: null,
  organizer: council(1, "Cultural Council"),
  organizer_id: 1,
  parent_id: null,
  children: [],
  registration_type: "INTERNAL",
  state_history: [],
  tag_line: "Don't miss out!",
  tags: partial.tags ?? ["Tech"],
  updated_at: d(-1).toISOString(),
  venue: partial.venue ?? "Seminar Hall, KJSCE",
  Participant: false,
  more_details_enabled: false,
  report_url: "",
  urls: {},
  tickets_sold: 120,
  ticket_count: 500,
  ...partial,
});

/* ─── Backwards-compat alias ─── */
export const dummyCouncils: Council[] = councilList;

export const dummyUser: User = {
  id: 1,
  name: "Arnav Sharma",
  email: "arnav.sharma@somaiya.edu",
  role: "STUDENT",
  degree: "B.Tech",
  branch: "Computer Engineering",
  gender: "Male",
  interests: ["Web Dev", "AI/ML", "Hackathons"],
  phone_number: 9876543210,
  photo_url: "https://i.pravatar.cc/150?u=student1",
  roll_number: 220022001,
  year: 2026,
  about: "Passionate about building great products.",
  college: "KJSCE",
  is_somaiya_student: true,
};


const festParent = baseEvent({
  id: 100,
  name: "KJSCE Fest 2026",
  state: "UPCOMING",
  description: "The biggest annual college fest.",
  dates: [d(14), d(15), d(16)],
  children: [{ id: 101 }, { id: 102 }, { id: 103 }],
  banner_url: "https://picsum.photos/seed/fest/800/400",
  tags: ["Fest", "Cultural"],
});

const festChild1 = baseEvent({
  id: 101,
  name: "Battle of Bands",
  state: "REGISTRATION_OPEN",
  parent_id: 100,
  dates: [d(14, 18)],
  venue: "Open Air Theatre",
  organizer: council(2, "Music Council"),
  tags: ["Music", "Registered"],
  ma_ppt: 4,
  min_ppt: 2,
});

const festChild2 = baseEvent({
  id: 102,
  name: "Code Rush Hackathon",
  state: "REGISTRATION_OPEN",
  parent_id: 100,
  dates: [d(15, 9)],
  venue: "Computer Lab 3",
  organizer: council(3, "Tech Council"),
  tags: ["Tech", "Hackathon"],
  ma_ppt: 4,
  min_ppt: 2,
});

const festChild3 = baseEvent({
  id: 103,
  name: "Street Dance Showdown",
  state: "UPCOMING",
  parent_id: 100,
  dates: [d(16, 17)],
  venue: "Main Ground",
  organizer: council(1, "Cultural Council"),
  tags: ["Dance"],
});

const allEventsList: EventData[] = [
  festParent,
  festChild1,
  festChild2,
  festChild3,
  baseEvent({
    id: 1,
    name: "AI Workshop Series",
    state: "UPCOMING",
    dates: [d(10)],
    tags: ["Tech", "Workshop"],
    organizer: council(3, "Tech Council"),
  }),
  baseEvent({
    id: 2,
    name: "Startup Pitch Night",
    state: "REGISTRATION_OPEN",
    dates: [d(5)],
    tags: ["Entrepreneurship"],
    organizer: council(4, "E-Cell"),
  }),
  baseEvent({
    id: 3,
    name: "Photography Walk",
    state: "TICKET_OPEN",
    dates: [d(3)],
    tags: ["Arts"],
    Participant: {
      id: 301,
      ticket_collected: false,
      team: null,
    },
  }),
  baseEvent({
    id: 4,
    name: "Inter-College Cricket",
    state: "TICKET_OPEN",
    dates: [d(2)],
    tags: ["Sports"],
    venue: "Sports Ground",
    Participant: {
      id: 401,
      ticket_collected: true,
      team: null,
    },
  }),
  baseEvent({
    id: 5,
    name: "Design Thinking Bootcamp",
    state: "ONGOING",
    dates: [d(0)],
    tags: ["Design"],
    start_in_event_activity: true,
    in_event_activity: "https://example.com/live-session",
  }),
  baseEvent({
    id: 6,
    name: "Robotics Expo",
    state: "TICKET_CLOSED",
    dates: [d(-2)],
    tags: ["Tech"],
    Participant: {
      id: 601,
      ticket_collected: true,
      team: null,
    },
  }),
  baseEvent({
    id: 7,
    name: "Alumni Meet 2025",
    state: "COMPLETED",
    dates: [d(-30)],
    tags: ["Networking"],
    is_feedback_enabled: true,
    Participant: {
      id: 701,
      ticket_collected: true,
      team: null,
    },
  }),
  baseEvent({
    id: 8,
    name: "Team Coding Challenge",
    state: "REGISTRATION_OPEN",
    dates: [d(8)],
    tags: ["Tech"],
    ma_ppt: 3,
    min_ppt: 2,
    organizer: council(3, "Tech Council"),
    Participant: {
      id: 801,
      ticket_collected: false,
      team: {
        id: 1,
        name: "Code Warriors",
        leader_id: 1,
        invite_code: "CW26X",
        Participant: [
          {
            user: {
              id: 1,
              name: "Arnav Sharma",
              photo_url: dummyUser.photo_url,
            },
          },
          {
            user: {
              id: 2,
              name: "Dev Patel",
              photo_url: "https://i.pravatar.cc/150?u=dev1",
            },
          },
        ],
      },
    },
  }),
];

export const dummyEvents: Events = {
  UPCOMING: allEventsList.filter((e) => e.state === "UPCOMING"),
  REGISTRATION_OPEN: allEventsList.filter(
    (e) => e.state === "REGISTRATION_OPEN",
  ),
  REGISTRATION_CLOSED: allEventsList.filter(
    (e) => e.state === "REGISTRATION_CLOSED",
  ),
  TICKET_CLOSED: allEventsList.filter((e) => e.state === "TICKET_CLOSED"),
  TICKET_OPEN: allEventsList.filter((e) => e.state === "TICKET_OPEN"),
  ONGOING: allEventsList.filter((e) => e.state === "ONGOING"),
  COMPLETED: allEventsList.filter((e) => e.state === "COMPLETED"),
};

export function getAllEventsFlat(): EventData[] {
  return allEventsList;
}

export function getEventById(id: number): EventData | undefined {
  return allEventsList.find((e) => e.id === id);
}

export function getMyEvents(): EventData[] {
  return allEventsList.filter((e) => e.Participant !== false);
}

export function getCouncilById(id: number): Council | undefined {
  return councilList.find((c) => c.id === id);
}

export function getEventsByCouncilId(id: number): EventData[] {
  return allEventsList.filter((e) => e.organizer_id === id);
}

export function getPastEventsByCouncilId(id: number): EventData[] {
  const past = ["COMPLETED", "TICKET_CLOSED", "TICKET_OPEN"];
  return allEventsList.filter(
    (e) => e.organizer_id === id && past.includes(e.state),
  );
}

export function getUpcomingEventsByCouncilId(id: number): EventData[] {
  const upcoming = ["UPCOMING", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "ONGOING"];
  return allEventsList.filter(
    (e) => e.organizer_id === id && upcoming.includes(e.state),
  );
}
