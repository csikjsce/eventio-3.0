// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApprovalStep {
  stage: string;
  label: string;
  status: "done" | "active" | "pending" | "rejected";
  actor: string;
  date?: string;
  note?: string;
}

export interface EventDocument {
  id: string;
  name: string;
  type: "proposal" | "noc" | "budget" | "letter" | "report" | "geo_tag" | "other";
  url?: string;
  uploaded_at?: string;
  required: boolean;
}

export interface EventData {
  id: number;
  name: string;
  tag_line: string;
  description: string;
  long_description: string;
  event_type: string;
  state: string;
  pipeline_stage: PipelineStage;
  dates: string[];
  venue?: string;
  online_event_link?: string;
  fee: number;
  ticket_count: number;
  tickets_sold?: number;
  banner_url: string;
  event_page_image_url: string;
  logo_image_url?: string;
  organizer_id: number;
  ma_ppt: number;
  min_ppt: number;
  is_ticket_feature_enabled: boolean;
  is_feedback_enabled?: boolean;
  is_only_somaiya?: boolean;
  registration_type?: string;
  external_registration_link?: string;
  attendance_type?: string | null;
  in_event_activity?: string | null;
  start_in_event_activity?: boolean | null;
  female_requirement?: number | null;
  more_details_enabled?: boolean;
  is_submission_enabled?: boolean;
  report_url?: string | null;
  geo_tag_url?: string | null;
  parent_id?: number | null;
  urls?: Record<string, string>;
  comment?: string;
  children: { id: number }[];
  organizer: { id: number; name: string; photo_url: string };
  approval_chain: ApprovalStep[];
  documents: EventDocument[];
}

export type PipelineStage =
  | "DRAFT"
  | "PROPOSAL_SUBMITTED"
  | "PROPOSAL_APPROVED"
  | "BOOKING_PENDING"
  | "DIRECTOR_VP_PENDING"
  | "FULLY_APPROVED"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSED"
  | "ONGOING"
  | "COMPLETED"
  | "REPORT_SUBMITTED"
  | "REJECTED";

export const PIPELINE_STAGES: { id: PipelineStage; label: string; short: string }[] = [
  { id: "DRAFT",               label: "Draft",               short: "Draft"      },
  { id: "PROPOSAL_SUBMITTED",  label: "Proposal Submitted",  short: "Proposal"   },
  { id: "PROPOSAL_APPROVED",   label: "Faculty Approved",    short: "Faculty ✓"  },
  { id: "BOOKING_PENDING",     label: "Venue Booking",       short: "Booking"    },
  { id: "DIRECTOR_VP_PENDING", label: "Director / VP",       short: "Director"   },
  { id: "FULLY_APPROVED",      label: "Fully Approved",      short: "Approved ✓" },
  { id: "REGISTRATION_OPEN",   label: "Registration Open",   short: "Reg. Open"  },
  { id: "ONGOING",             label: "Ongoing",             short: "Ongoing"    },
  { id: "COMPLETED",           label: "Completed",           short: "Done"       },
  { id: "REPORT_SUBMITTED",    label: "Report Submitted",    short: "Report ✓"   },
];

// ─── Council user ─────────────────────────────────────────────────────────────

export const COUNCIL_USER = {
  id: 1,
  name: "CSI KJSCE",
  email: "csi@somaiya.edu",
  photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=CSI&backgroundColor=b61f2d&textColor=ffffff",
};

// ─── Mock events ─────────────────────────────────────────────────────────────

export const MOCK_EVENTS: EventData[] = [
  {
    id: 1, name: "HackSphere 2026", tag_line: "Code. Create. Conquer.",
    description: "A 24-hour hackathon for KJSCE students to build innovative tech solutions.",
    long_description: "HackSphere 2026 is KJSCE's flagship 24-hour hackathon. Teams of 2–5 will ideate, design, and build projects across AI, Web3, Sustainability and Open Innovation tracks. Prizes worth ₹1,50,000 up for grabs. Industry mentors, workshops, and live judging throughout the night.",
    event_type: "COMPETETION", state: "REGISTRATION_OPEN", pipeline_stage: "REGISTRATION_OPEN",
    dates: ["2026-06-15T09:00:00", "2026-06-16T09:00:00"],
    venue: "KJSCE Main Auditorium, Vidyavihar", fee: 0, ticket_count: 300, tickets_sold: 142,
    banner_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    event_page_image_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    organizer_id: 1, ma_ppt: 5, min_ppt: 2,
    is_ticket_feature_enabled: true, is_feedback_enabled: true, is_only_somaiya: true,
    registration_type: "ONPLATFORM", attendance_type: "TICKET",
    children: [], organizer: COUNCIL_USER,
    approval_chain: [
      { stage: "PROPOSAL_SUBMITTED",  label: "Proposal Submitted",       status: "done",   actor: "CSI KJSCE",       date: "2026-04-10T10:00:00" },
      { stage: "PROPOSAL_APPROVED",   label: "Faculty Advisor Approved", status: "done",   actor: "Prof. Anita Desai", date: "2026-04-14T11:30:00", note: "Proposal looks good. Proceed with booking." },
      { stage: "BOOKING_PENDING",     label: "Venue Booking Signed",     status: "done",   actor: "Gen. Secretary + Faculty Advisor", date: "2026-04-20T14:00:00" },
      { stage: "DIRECTOR_VP_PENDING", label: "Director / VP Approved",   status: "done",   actor: "Dr. Ramesh Kumar (Director)", date: "2026-04-25T09:00:00", note: "Approved. Ensure safety protocols are followed." },
      { stage: "FULLY_APPROVED",      label: "Fully Cleared",            status: "done",   actor: "System",          date: "2026-04-25T09:05:00" },
      { stage: "REGISTRATION_OPEN",   label: "Registration Opened",      status: "active", actor: "CSI KJSCE",       date: "2026-05-01T10:00:00" },
    ],
    documents: [
      { id: "d1", name: "Event Proposal.pdf",          type: "proposal", url: "#", uploaded_at: "2026-04-10", required: true  },
      { id: "d2", name: "Venue Booking Letter.pdf",    type: "noc",      url: "#", uploaded_at: "2026-04-20", required: true  },
      { id: "d3", name: "Estimated Budget Sheet.pdf",  type: "budget",   url: "#", uploaded_at: "2026-04-20", required: true  },
      { id: "d4", name: "Director Approval Letter.pdf",type: "letter",   url: "#", uploaded_at: "2026-04-25", required: true  },
    ],
  },
  {
    id: 2, name: "UI/UX Design Workshop", tag_line: "Design Thinking for Engineers",
    description: "Hands-on workshop covering Figma, design principles, and user research methodology.",
    long_description: "This full-day workshop will walk you through the fundamentals of UI/UX design using Figma. You'll learn about wireframing, prototyping, design systems, and how to conduct user research.",
    event_type: "WORKSHOP", state: "UPCOMING", pipeline_stage: "DIRECTOR_VP_PENDING",
    dates: ["2026-07-05T10:00:00"],
    venue: "Seminar Hall 1, KJSCE", fee: 100, ticket_count: 80, tickets_sold: 0,
    banner_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    event_page_image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    organizer_id: 1, ma_ppt: 1, min_ppt: 1,
    is_ticket_feature_enabled: true, is_only_somaiya: true,
    registration_type: "ONPLATFORM", attendance_type: null,
    children: [], organizer: COUNCIL_USER,
    approval_chain: [
      { stage: "PROPOSAL_SUBMITTED",  label: "Proposal Submitted",       status: "done",   actor: "CSI KJSCE",       date: "2026-05-01T09:00:00" },
      { stage: "PROPOSAL_APPROVED",   label: "Faculty Advisor Approved", status: "done",   actor: "Prof. Anita Desai", date: "2026-05-05T11:00:00", note: "Approved. Ensure external speakers are booked." },
      { stage: "BOOKING_PENDING",     label: "Venue Booking Signed",     status: "done",   actor: "Gen. Secretary + Faculty Advisor", date: "2026-05-10T14:00:00" },
      { stage: "DIRECTOR_VP_PENDING", label: "Director / VP Approval",   status: "active", actor: "Awaiting Dr. Ramesh Kumar", },
    ],
    documents: [
      { id: "d5", name: "Workshop Proposal.pdf",       type: "proposal", url: "#", uploaded_at: "2026-05-01", required: true  },
      { id: "d6", name: "Seminar Hall Booking.pdf",    type: "noc",      url: "#", uploaded_at: "2026-05-10", required: true  },
      { id: "d7", name: "Director Approval Letter.pdf",type: "letter",   required: true  },
    ],
  },
  {
    id: 3, name: "TechTalks: AI Edition", tag_line: "Conversations That Shape Tomorrow",
    description: "Speaker session featuring industry leaders from Google, Zepto, and OpenAI India.",
    long_description: "TechTalks: AI Edition brings together engineers, researchers, and founders building with AI to share their journeys, learnings, and predictions for the future.",
    event_type: "SPEAKER_SESSION", state: "COMPLETED", pipeline_stage: "REPORT_SUBMITTED",
    dates: ["2026-02-10T14:00:00"],
    venue: "KJSCE Auditorium", fee: 0, ticket_count: 400, tickets_sold: 398,
    banner_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
    event_page_image_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
    organizer_id: 1, ma_ppt: 1, min_ppt: 1,
    is_ticket_feature_enabled: false, is_feedback_enabled: true, is_only_somaiya: false,
    registration_type: "ONPLATFORM",
    report_url: "https://drive.google.com/techtalk-report",
    geo_tag_url: "https://drive.google.com/techtalk-photos",
    children: [], organizer: COUNCIL_USER,
    approval_chain: [
      { stage: "PROPOSAL_SUBMITTED",  label: "Proposal Submitted",       status: "done", actor: "CSI KJSCE",       date: "2025-12-01T10:00:00" },
      { stage: "PROPOSAL_APPROVED",   label: "Faculty Advisor Approved", status: "done", actor: "Prof. Anita Desai", date: "2025-12-05T10:00:00" },
      { stage: "BOOKING_PENDING",     label: "Venue Booking Signed",     status: "done", actor: "Gen. Secretary + Faculty Advisor", date: "2025-12-15T14:00:00" },
      { stage: "DIRECTOR_VP_PENDING", label: "Director / VP Approved",   status: "done", actor: "Dr. Ramesh Kumar",  date: "2025-12-20T09:00:00" },
      { stage: "FULLY_APPROVED",      label: "Fully Cleared",            status: "done", actor: "System",           date: "2025-12-20T09:05:00" },
      { stage: "REGISTRATION_OPEN",   label: "Registration Opened",      status: "done", actor: "CSI KJSCE",        date: "2026-01-10T10:00:00" },
      { stage: "COMPLETED",           label: "Event Completed",          status: "done", actor: "System",           date: "2026-02-10T18:00:00" },
      { stage: "REPORT_SUBMITTED",    label: "Report Submitted",         status: "done", actor: "CSI KJSCE",        date: "2026-02-15T12:00:00", note: "Report and geo-tagged photos submitted successfully." },
    ],
    documents: [
      { id: "d8",  name: "Event Proposal.pdf",          type: "proposal", url: "#", uploaded_at: "2025-12-01", required: true  },
      { id: "d9",  name: "Auditorium NOC.pdf",          type: "noc",      url: "#", uploaded_at: "2025-12-15", required: true  },
      { id: "d10", name: "Budget Estimate.pdf",         type: "budget",   url: "#", uploaded_at: "2025-12-15", required: true  },
      { id: "d11", name: "Director Approval.pdf",       type: "letter",   url: "#", uploaded_at: "2025-12-20", required: true  },
      { id: "d12", name: "Event Report.pdf",            type: "report",   url: "https://drive.google.com/techtalk-report", uploaded_at: "2026-02-15", required: true },
      { id: "d13", name: "Geo-tagged Photos.zip",       type: "geo_tag",  url: "https://drive.google.com/techtalk-photos", uploaded_at: "2026-02-15", required: false },
    ],
  },
  {
    id: 4, name: "Robo Rumble", tag_line: "Let Machines Fight",
    description: "Annual robotics competition — build a bot and battle it out on the arena floor.",
    long_description: "Robo Rumble is KJSCE's annual inter-college robotics competition. Teams build bots under strict size and weight constraints and compete in elimination rounds on a custom arena.",
    event_type: "COMPETETION", state: "DRAFT", pipeline_stage: "DRAFT",
    dates: ["2026-08-20T09:00:00"],
    venue: "KJSCE Workshop, Vidyavihar", fee: 200, ticket_count: 60, tickets_sold: 0,
    banner_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    event_page_image_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    organizer_id: 1, ma_ppt: 3, min_ppt: 2,
    is_ticket_feature_enabled: false, is_only_somaiya: false,
    registration_type: "ONPLATFORM", attendance_type: null,
    children: [], organizer: COUNCIL_USER,
    approval_chain: [],
    documents: [],
  },
  {
    id: 5, name: "Code Sprint", tag_line: "60 Minutes. One Problem. Go.",
    description: "Speed competitive programming contest — top performers win Amazon vouchers.",
    long_description: "Code Sprint is a fast-paced competitive programming contest where participants solve algorithmic problems under time pressure. Languages allowed: C++, Python, Java.",
    event_type: "COMPETETION", state: "ONGOING", pipeline_stage: "ONGOING",
    dates: ["2026-05-24T10:00:00"],
    venue: "Lab 302, KJSCE", fee: 0, ticket_count: 120, tickets_sold: 115,
    banner_url: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800",
    event_page_image_url: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800",
    organizer_id: 1, ma_ppt: 1, min_ppt: 1,
    is_ticket_feature_enabled: false, is_only_somaiya: true,
    registration_type: "ONPLATFORM", attendance_type: "TICKET",
    children: [], organizer: COUNCIL_USER,
    approval_chain: [
      { stage: "PROPOSAL_SUBMITTED",  label: "Proposal Submitted",       status: "done", actor: "CSI KJSCE",       date: "2026-04-15T10:00:00" },
      { stage: "PROPOSAL_APPROVED",   label: "Faculty Advisor Approved", status: "done", actor: "Prof. Anita Desai", date: "2026-04-18T11:00:00" },
      { stage: "BOOKING_PENDING",     label: "Venue Booking Signed",     status: "done", actor: "Gen. Secretary + Faculty Advisor", date: "2026-04-22T14:00:00" },
      { stage: "DIRECTOR_VP_PENDING", label: "Director / VP Approved",   status: "done", actor: "Dr. Ramesh Kumar",  date: "2026-04-28T09:00:00" },
      { stage: "FULLY_APPROVED",      label: "Fully Cleared",            status: "done", actor: "System",           date: "2026-04-28T09:05:00" },
      { stage: "ONGOING",             label: "Event Live",               status: "active", actor: "System",         date: "2026-05-24T10:00:00" },
    ],
    documents: [
      { id: "d14", name: "Event Proposal.pdf",   type: "proposal", url: "#", uploaded_at: "2026-04-15", required: true },
      { id: "d15", name: "Lab Booking Slip.pdf", type: "noc",      url: "#", uploaded_at: "2026-04-22", required: true },
      { id: "d16", name: "Director Approval.pdf",type: "letter",   url: "#", uploaded_at: "2026-04-28", required: true },
    ],
  },
  {
    id: 6, name: "Cybersecurity Bootcamp", tag_line: "Hack to Defend",
    description: "3-day intensive bootcamp on ethical hacking, CTF challenges, and network security.",
    long_description: "A 3-day intensive program covering the fundamentals of ethical hacking, network security, CTF challenges, and defensive security strategies. Led by industry professionals.",
    event_type: "WORKSHOP", state: "DRAFT", pipeline_stage: "PROPOSAL_SUBMITTED",
    dates: ["2026-09-10T09:00:00", "2026-09-11T09:00:00", "2026-09-12T09:00:00"],
    venue: "Seminar Hall 3, KJSCE", fee: 300, ticket_count: 50, tickets_sold: 0,
    banner_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
    event_page_image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
    organizer_id: 1, ma_ppt: 1, min_ppt: 1,
    is_ticket_feature_enabled: true, is_only_somaiya: true,
    registration_type: "ONPLATFORM", attendance_type: null,
    children: [], organizer: COUNCIL_USER,
    approval_chain: [
      { stage: "PROPOSAL_SUBMITTED", label: "Proposal Submitted",       status: "active", actor: "CSI KJSCE", date: "2026-05-20T10:00:00" },
    ],
    documents: [
      { id: "d17", name: "Bootcamp Proposal.pdf", type: "proposal", url: "#", uploaded_at: "2026-05-20", required: true },
    ],
  },
];

export function getEventById(id: number) {
  return MOCK_EVENTS.find((e) => e.id === id) ?? null;
}

// ─── Pipeline helpers ─────────────────────────────────────────────────────────

export function getPipelineIndex(stage: PipelineStage): number {
  return PIPELINE_STAGES.findIndex(s => s.id === stage);
}

export function getNextAction(event: EventData): { label: string; cta: string; route?: string } | null {
  switch (event.pipeline_stage) {
    case "DRAFT":              return { label: "Submit proposal to faculty advisor",     cta: "Submit Proposal" };
    case "PROPOSAL_SUBMITTED": return { label: "Waiting for faculty advisor approval",  cta: "Check Status" };
    case "PROPOSAL_APPROVED":  return { label: "Faculty advisor approved! Forward to Director / Vice Principal for sign-off.", cta: "Forward to Director/VP" };
    case "BOOKING_PENDING":    return { label: "Circulate to Director and Vice Principal for sign-off", cta: "Forward to Director/VP" };
    case "DIRECTOR_VP_PENDING":return { label: "Waiting for Director / Vice Principal approval", cta: "Check Status" };
    case "FULLY_APPROVED":     return { label: "All approvals done! Open registrations.",cta: "Open Registration" };
    case "REGISTRATION_OPEN":  return { label: "Registration is live. Monitor sign-ups.", cta: "View Participants", route: `/participants` };
    case "REGISTRATION_CLOSED":return { label: "Registration closed. Prepare for the event.", cta: "View Participants", route: `/participants` };
    case "ONGOING":            return { label: "Event is live! Mark attendance.",         cta: "Mark Attendance", route: `/attendance` };
    case "COMPLETED":          return { label: "Event complete. Submit report + geo-tagged photos.", cta: "Submit Report" };
    case "REPORT_SUBMITTED":   return { label: "All done! View post-event statistics.",   cta: "View Statistics", route: `/statistics` };
    case "REJECTED":           return { label: "Submission was rejected. Review feedback and resubmit.", cta: "Edit & Resubmit", route: `/new-event/${event.id}` };
    default:                   return null;
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export const MOCK_STATS = [
  { eventId: "1", eventName: "HackSphere 2026", organizerId: "1", totalParticipants: 312,
    branchStats: { Computer_Engineering: 120, Information_Technology: 80, Artificial_Intelligence_And_Data_Science: 60, Electronics_And_Telecommunications: 30, Mechanical: 22 },
    genderStats: { MALE: 210, FEMALE: 102 }, yearStats: { "2027": 90, "2028": 110, "2029": 75, "2030": 37 }, dates: ["2026-03-15T09:00:00"] },
  { eventId: "2", eventName: "UI/UX Workshop", organizerId: "1", totalParticipants: 85,
    branchStats: { Computer_Engineering: 30, Information_Technology: 25, Computer_Science_And_Business_Systems: 20, Mechanical: 10 },
    genderStats: { MALE: 45, FEMALE: 40 }, yearStats: { "2027": 20, "2028": 35, "2029": 20, "2030": 10 }, dates: ["2026-01-20T10:00:00"] },
  { eventId: "3", eventName: "TechTalks: AI Edition", organizerId: "1", totalParticipants: 220,
    branchStats: { Computer_Engineering: 75, Information_Technology: 55, Artificial_Intelligence_And_Data_Science: 50, Electronics_And_Computers: 25, Robotics_And_Artificial_Intelligence: 15 },
    genderStats: { MALE: 155, FEMALE: 65 }, yearStats: { "2027": 60, "2028": 80, "2029": 55, "2030": 25 }, dates: ["2026-02-10T14:00:00"] },
  { eventId: "4", eventName: "Robo Rumble", organizerId: "1", totalParticipants: 140,
    branchStats: { Mechanical: 40, Robotics_And_Artificial_Intelligence: 50, Electronics: 30, Electronics_And_Computers: 20 },
    genderStats: { MALE: 105, FEMALE: 35 }, yearStats: { "2027": 30, "2028": 50, "2029": 40, "2030": 20 }, dates: ["2026-04-05T09:00:00"] },
  { eventId: "5", eventName: "Code Sprint", organizerId: "1", totalParticipants: 190,
    branchStats: { Computer_Engineering: 80, Information_Technology: 60, Computer_Science_And_Business_Systems: 30, Artificial_Intelligence_And_Data_Science: 20 },
    genderStats: { MALE: 130, FEMALE: 60 }, yearStats: { "2027": 50, "2028": 70, "2029": 50, "2030": 20 }, dates: ["2026-05-01T09:00:00"] },
];

// ─── Participants ─────────────────────────────────────────────────────────────

export interface Participant {
  id: number; name: string; roll: string; branch: string;
  year: string; gender: string; email: string; phone: string; attended: boolean;
}

export const MOCK_PARTICIPANTS: Record<number, Participant[]> = {
  1: [
    { id: 1,  name: "Aanya Sharma",   roll: "21COMP001", branch: "COMP", year: "SY", gender: "FEMALE", email: "aanya@somaiya.edu",  phone: "9876543210", attended: true  },
    { id: 2,  name: "Rohan Mehta",    roll: "21COMP002", branch: "COMP", year: "SY", gender: "MALE",   email: "rohan@somaiya.edu",  phone: "9876543211", attended: true  },
    { id: 3,  name: "Priya Nair",     roll: "21IT001",   branch: "IT",   year: "TY", gender: "FEMALE", email: "priya@somaiya.edu",  phone: "9876543212", attended: false },
    { id: 4,  name: "Dev Patel",      roll: "22AIDS001", branch: "AIDS", year: "FY", gender: "MALE",   email: "dev@somaiya.edu",    phone: "9876543213", attended: true  },
    { id: 5,  name: "Sneha Kulkarni", roll: "21EXTC001", branch: "EXTC", year: "TY", gender: "FEMALE", email: "sneha@somaiya.edu",  phone: "9876543214", attended: false },
    { id: 6,  name: "Arjun Singh",    roll: "20COMP001", branch: "COMP", year: "LY", gender: "MALE",   email: "arjun@somaiya.edu",  phone: "9876543215", attended: true  },
    { id: 7,  name: "Meera Joshi",    roll: "21MECH001", branch: "Mech", year: "SY", gender: "FEMALE", email: "meera@somaiya.edu",  phone: "9876543216", attended: true  },
    { id: 8,  name: "Karan Verma",    roll: "22IT001",   branch: "IT",   year: "FY", gender: "MALE",   email: "karan@somaiya.edu",  phone: "9876543217", attended: false },
    { id: 9,  name: "Isha Desai",     roll: "21AIDS001", branch: "AIDS", year: "SY", gender: "FEMALE", email: "isha@somaiya.edu",   phone: "9876543218", attended: true  },
    { id: 10, name: "Vivek Rao",      roll: "21EXTC002", branch: "EXTC", year: "TY", gender: "MALE",   email: "vivek@somaiya.edu",  phone: "9876543219", attended: true  },
    { id: 11, name: "Tanvi Patil",    roll: "20IT001",   branch: "IT",   year: "LY", gender: "FEMALE", email: "tanvi@somaiya.edu",  phone: "9876543220", attended: false },
    { id: 12, name: "Nikhil Gupta",   roll: "22COMP001", branch: "COMP", year: "FY", gender: "MALE",   email: "nikhil@somaiya.edu", phone: "9876543221", attended: true  },
  ],
  2: [
    { id: 13, name: "Sakshi Tiwari", roll: "21COMP003", branch: "COMP", year: "SY", gender: "FEMALE", email: "sakshi@somaiya.edu", phone: "9876543222", attended: true  },
    { id: 14, name: "Harsh Modi",    roll: "21IT002",   branch: "IT",   year: "TY", gender: "MALE",   email: "harsh@somaiya.edu",  phone: "9876543223", attended: true  },
    { id: 15, name: "Pooja Iyer",    roll: "20EXTC001", branch: "EXTC", year: "LY", gender: "FEMALE", email: "pooja@somaiya.edu",  phone: "9876543224", attended: false },
    { id: 16, name: "Raj Thakur",    roll: "22AIDS002", branch: "AIDS", year: "FY", gender: "MALE",   email: "raj@somaiya.edu",    phone: "9876543225", attended: true  },
    { id: 17, name: "Nisha Bhat",    roll: "21MECH002", branch: "Mech", year: "SY", gender: "FEMALE", email: "nisha@somaiya.edu",  phone: "9876543226", attended: true  },
  ],
  5: [
    { id: 18, name: "Aryan Kapoor",   roll: "21COMP004", branch: "COMP", year: "SY", gender: "MALE",   email: "aryan@somaiya.edu",  phone: "9876543227", attended: true  },
    { id: 19, name: "Divya Singh",    roll: "21IT003",   branch: "IT",   year: "TY", gender: "FEMALE", email: "divya@somaiya.edu",  phone: "9876543228", attended: true  },
    { id: 20, name: "Saurabh Jain",   roll: "22COMP002", branch: "COMP", year: "FY", gender: "MALE",   email: "saurabh@somaiya.edu",phone: "9876543229", attended: false },
    { id: 21, name: "Kavya Reddy",    roll: "21AIDS002", branch: "AIDS", year: "SY", gender: "FEMALE", email: "kavya@somaiya.edu",  phone: "9876543230", attended: true  },
    { id: 22, name: "Mihir Shah",     roll: "20IT002",   branch: "IT",   year: "LY", gender: "MALE",   email: "mihir@somaiya.edu",  phone: "9876543231", attended: true  },
  ],
};

// ─── Budget items ─────────────────────────────────────────────────────────────

export interface BudgetItem {
  id: string; event_id: number; category: string;
  description: string; amount: number;
  type: "INCOME" | "EXPENSE"; date: string;
}

export const INITIAL_ITEMS: BudgetItem[] = [
  { id: "b1",  event_id: 1, category: "Sponsorship", description: "Microsoft Azure sponsorship",  amount: 50000, type: "INCOME",  date: "2026-04-10" },
  { id: "b2",  event_id: 1, category: "Registration",description: "Registration fees (300 teams)",amount: 0,     type: "INCOME",  date: "2026-05-01" },
  { id: "b3",  event_id: 1, category: "Prizes",      description: "Prize pool",                   amount: 75000, type: "EXPENSE", date: "2026-06-16" },
  { id: "b4",  event_id: 1, category: "Venue",       description: "Auditorium setup & AV",        amount: 15000, type: "EXPENSE", date: "2026-06-14" },
  { id: "b5",  event_id: 1, category: "Catering",    description: "Food & beverages overnight",   amount: 20000, type: "EXPENSE", date: "2026-06-15" },
  { id: "b6",  event_id: 3, category: "Sponsorship", description: "Google Developer sponsorship", amount: 30000, type: "INCOME",  date: "2025-12-15" },
  { id: "b7",  event_id: 3, category: "Venue",       description: "Auditorium booking",           amount: 5000,  type: "EXPENSE", date: "2026-02-09" },
  { id: "b8",  event_id: 3, category: "Marketing",   description: "Banners and posters",          amount: 3000,  type: "EXPENSE", date: "2026-02-05" },
  { id: "b9",  event_id: 5, category: "Prizes",      description: "Amazon vouchers (top 5)",      amount: 5500,  type: "EXPENSE", date: "2026-05-24" },
  { id: "b10", event_id: 5, category: "Venue",       description: "Lab booking fee",              amount: 0,     type: "EXPENSE", date: "2026-05-24" },
];

// ─── Announcements ────────────────────────────────────────────────────────────

export interface Announcement {
  id: string; event_id: number | "ALL"; event_name: string;
  title: string; body: string; channel: "EMAIL" | "PUSH" | "BOTH";
  sent_at: string; recipient_count: number;
}

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", event_id: 1, event_name: "HackSphere 2026",    title: "Registration closing soon!",  body: "Only 50 spots left for HackSphere 2026. Register before June 10 to secure your spot.", channel: "BOTH",  sent_at: "2026-05-20T10:00:00", recipient_count: 142 },
  { id: "a2", event_id: 3, event_name: "TechTalks: AI Edition", title: "Thank you for attending!", body: "Thank you to all 398 attendees. Feedback form is now live — your responses help us improve.", channel: "EMAIL", sent_at: "2026-02-11T09:00:00", recipient_count: 398 },
  { id: "a3", event_id: "ALL", event_name: "All Events",     title: "CSI KJSCE — New semester events coming soon", body: "Stay tuned! We have exciting workshops, hackathons, and speaker sessions lined up for the new semester.", channel: "PUSH", sent_at: "2026-05-01T11:00:00", recipient_count: 850 },
];

export const ANNOUNCEMENT_TEMPLATES = [
  { id: "reminder",     label: "Registration Reminder",   title: "Don't miss out — {Event} registration is closing soon!", body: "Spots are filling up fast for {Event}. Register now before {Date} to secure your place. Visit Eventio for details." },
  { id: "update",       label: "Event Update",            title: "Important update for {Event}", body: "We have an important update regarding {Event}. Please read carefully and reach out to us if you have questions." },
  { id: "cancellation", label: "Event Cancellation",      title: "{Event} has been cancelled", body: "We regret to inform you that {Event} scheduled for {Date} has been cancelled. We apologize for the inconvenience." },
  { id: "thankyou",     label: "Thank You",               title: "Thank you for attending {Event}!", body: "Thank you for joining us at {Event}. We hope you had a great experience. Your feedback means a lot — please fill out our feedback form." },
  { id: "venue",        label: "Venue Change",            title: "Venue update for {Event}", body: "Please note that the venue for {Event} has been changed. The event will now be held at [New Venue]. The time remains the same." },
];
