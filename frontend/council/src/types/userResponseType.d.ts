// TypeScript Interface for Event Data
interface EventData {
  attendance_type: string | null;
  banner_url: string;
  created_at: string;
  dates: Date[];
  description: string;
  event_page_image_url: string;
  event_type: string;
  external_registration_link: string | null;
  fee: number;
  id: number;
  is_feedback_enabled: boolean;
  is_only_somaiya: boolean;
  is_ticket_feature_enabled: boolean;
  logo_image__url: string;
  long_description: string;
  ma_ppt: number;
  min_ppt: number;
  name: string;
  online_event_link: string | null;
  organizer: {
    name: string;
    photo_url: string;
    id: number;
    email: string;
  };
  organizer_id: number;
  parent_id: number | null;
  children: { id: number }[];
  registration_type: string;
  state: string;
  state_history: string[];
  tag_line: string;
  tags: string[];
  updated_at: string;
  venue: string;
  Participant:
    | false
    | {
        attended: boolean;
      };
  in_event_activity?: string;
  start_in_event_activity?: boolean;
  comment?: string;
  ticket_count: number;
  tickets_sold: number;
}

// Interface for the Events object
interface Events {
  DRAFT: EventData[];
  APPLIED_FOR_APPROVAL: EventData[];
  UNLISTED: EventData[];
  UPCOMING: EventData[];
  REGISTRATION_OPEN: EventData[];
  REGISTRATION_CLOSED: EventData[];
  TICKET_OPEN: EventData[];
  TICKET_CLOSED: EventData[];
  ONGOING: EventData[];
  COMPLETED: EventData[];
  PRIVATE: EventData[];
}

// TypeScript Interface for User Data
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  degree: string;
  branch: string;
  gender: string;
  interests: string[];
  phone_number: number;
  photo_url: string;
  roll_number: number;
  year: number;
  about: string;
  college: string;
  is_somaiya_student: boolean;
};

type UserResponse = {
  error: boolean;
  message?: string;
  user?: User;
  events?: Events;
};
