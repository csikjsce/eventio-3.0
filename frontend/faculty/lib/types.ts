export interface ApprovalStep {
  stage:  string;
  label:  string;
  status: "done" | "active" | "pending" | "rejected";
  actor:  string;
  note?:  string;
}

export interface EventDocument {
  id:           number;
  name:         string;
  type:         string;
  url?:         string;
  uploaded_at?: string;
}

export interface BudgetItem {
  id:          number;
  name:        string;
  amount:      number;
  description?: string;
}

export interface EventData {
  id:                        number;
  name:                      string;
  tag_line?:                 string;
  description?:              string;
  long_description?:         string;
  event_type?:               string;
  state:                     string;
  dates:                     string[];
  venue?:                    string;
  fee?:                      number;
  ticket_count?:             number;
  tickets_sold?:             number;
  banner_url?:               string;
  event_page_image_url?:     string;
  is_ticket_feature_enabled?: boolean;
  is_only_somaiya?:          boolean;
  min_ppt?:                  number;
  ma_ppt?:                   number;
  comment?:                  string | null;
  state_history:             string[];
  approval_chain:            ApprovalStep[];
  organizer:                 { id: number; name: string; photo_url?: string; email?: string };
  organizer_id?:             number;
  children?:                 { id: number }[];
}

export interface FacultyUser {
  id:         number;
  name:       string;
  email:      string;
  photo_url?: string;
  role:       "FACULTY" | "PRINCIPAL" | string;
}

export interface StatsItem {
  eventId:           string;
  eventName:         string;
  organizerId:       string;
  totalParticipants: number;
  branchStats:       Record<string, number>;
  genderStats:       Record<string, number>;
  yearStats:         Record<string, number>;
  dates:             string[];
}

export interface CalendarEvent {
  id:          number;
  name:        string;
  tag_line?:   string;
  dates:       string[];
  venue?:      string;
  state:       string;
  banner_url?: string;
  event_type?: string;
  organizer:   { id: number; name: string; photo_url?: string };
}

export const STATE_BADGE: Record<string, { label: string; cls: string }> = {
  DRAFT:                       { label: "Draft",              cls: "bg-muted text-muted-foreground" },
  APPLIED_FOR_APPROVAL:        { label: "Awaiting Faculty",   cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  APPLIED_FOR_PRINCI_APPROVAL: { label: "Awaiting Principal", cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
  UNLISTED:                    { label: "Approved",           cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  UPCOMING:                    { label: "Upcoming",           cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  REGISTRATION_OPEN:           { label: "Registration Open",  cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  REGISTRATION_CLOSED:         { label: "Reg. Closed",        cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  TICKET_OPEN:                 { label: "Tickets Live",       cls: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  TICKET_CLOSED:               { label: "Tickets Closed",     cls: "bg-muted text-muted-foreground" },
  ONGOING:                     { label: "Live Now",           cls: "bg-red-500/15 text-red-600 dark:text-red-400" },
  COMPLETED:                   { label: "Completed",          cls: "bg-muted text-muted-foreground" },
  PRIVATE:                     { label: "Private",            cls: "bg-muted text-muted-foreground" },
};

export const PENDING_STATE: Record<string, string> = {
  FACULTY:   "APPLIED_FOR_APPROVAL",
  PRINCIPAL: "APPLIED_FOR_PRINCI_APPROVAL",
};

export function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
