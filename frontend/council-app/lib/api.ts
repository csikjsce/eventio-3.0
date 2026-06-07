import axios from "axios";
import type { ApprovalStep, EventData, PipelineStage } from "@/lib/dummy-data";

const SERVER = process.env.NEXT_PUBLIC_SERVER_ADDRESS ?? "";

export const api = axios.create({
  baseURL: `${SERVER}/api/v1`,
  timeout: 15_000,
});

// ── Token helpers ──────────────────────────────────────────────────────────────

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("council_accessToken") : null;
}
function getRefreshToken() {
  return typeof window !== "undefined" ? localStorage.getItem("council_refreshToken") : null;
}
export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("council_accessToken");
  localStorage.removeItem("council_refreshToken");
  window.location.replace("/login");
}

// ── Request interceptor — attach Authorization header ─────────────────────────

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — silent token refresh on 401 ────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err?.response?.status !== 401 || original._retry) {
      return Promise.reject(err);
    }
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error("no refresh token");
      const res = await axios.post(`${SERVER}/api/v1/auth/refresh-token`, { refreshToken });
      const newToken: string = res.data.accessToken;
      localStorage.setItem("council_accessToken", newToken);
      refreshQueue.forEach((fn) => fn(newToken));
      refreshQueue = [];
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      logout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

// ── Approval chain builder (from state_history) ───────────────────────────────

interface StateMeta {
  label:       string;
  reopenLabel?: string;
  actor:       string;
}

/** Human-readable labels + actors for each backend STATE enum value. */
const STATE_META: Record<string, StateMeta> = {
  DRAFT:                       { label: "Event Created",         actor: "You (Council)"   },
  APPLIED_FOR_APPROVAL:        { label: "Proposal Submitted",    actor: "Faculty Advisor" },
  APPLIED_FOR_PRINCI_APPROVAL: { label: "Faculty Cleared",       actor: "Principal"       },
  UNLISTED:                    { label: "Principal Approved",    actor: "You (Council)"   },
  UPCOMING:                    { label: "Event Listed",          reopenLabel: "Event Re-listed",           actor: "You (Council)" },
  REGISTRATION_OPEN:           { label: "Registration Opened",   reopenLabel: "Registration Reopened",   actor: "You (Council)" },
  REGISTRATION_CLOSED:         { label: "Registration Closed",   reopenLabel: "Registration Paused",       actor: "You (Council)" },
  TICKET_OPEN:                 { label: "Tickets Live",          reopenLabel: "Tickets Reopened",          actor: "You (Council)" },
  TICKET_CLOSED:               { label: "Ticket Sales Closed",   reopenLabel: "Ticket Sales Stopped",      actor: "You (Council)" },
  ONGOING:                     { label: "Event Started",         actor: "You (Council)"   },
  COMPLETED:                   { label: "Event Completed",       actor: "You (Council)"   },
  PRIVATE:                     { label: "Set to Private",        reopenLabel: "Set to Private Again",      actor: "You (Council)" },
};

function getStateMeta(stage: string): StateMeta {
  if (STATE_META[stage]) return STATE_META[stage];
  return {
    label: stage.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    actor: "System",
  };
}

/** Ensure history ends with the current state (handles legacy / out-of-sync rows). */
function normalizeStateHistory(currentState: string, stateHistory?: string[]): string[] {
  const history = (stateHistory ?? []).filter(Boolean).map(String);
  const state   = currentState || "DRAFT";

  if (history.length === 0) return [state];
  if (history[history.length - 1] !== state) return [...history, state];
  return history;
}

/**
 * Build the approval timeline from the event's state_history array.
 * Each state transition becomes one node — repeats (e.g. reopening registration)
 * appear as separate steps so the full journey is preserved.
 */
function buildApprovalChain(
  currentState: string,
  stateHistory: string[],
  comment?: string | null,
): ApprovalStep[] {
  const history    = normalizeStateHistory(currentState, stateHistory);
  const visitCount: Record<string, number> = {};

  const chain: ApprovalStep[] = history.map((stage, index) => {
    visitCount[stage] = (visitCount[stage] ?? 0) + 1;
    const meta     = getStateMeta(stage);
    const isLast   = index === history.length - 1;
    const isRepeat = visitCount[stage] > 1;

    const label = isRepeat && meta.reopenLabel
      ? meta.reopenLabel
      : isRepeat
        ? `${meta.label} (again)`
        : meta.label;

    return {
      stage,
      label,
      status: (isLast ? "active" : "done") as ApprovalStep["status"],
      actor:  meta.actor,
    };
  });

  // Show return-for-changes when faculty/principal sent the event back to draft
  if (currentState === "DRAFT" && comment?.trim() && chain.length > 1) {
    const lastIdx = chain.length - 1;
    if (chain[lastIdx]?.stage === "DRAFT" && chain[lastIdx]?.status === "active") {
      chain.splice(lastIdx, 0, {
        stage: "RETURNED",
        label: "Returned for Changes",
        status: "rejected",
        actor: "Faculty / Principal",
        note: comment.trim(),
      });
    }
  }

  return chain;
}

// ── State ↔ PipelineStage mapping ─────────────────────────────────────────────

export function mapStateToPipeline(state: string): PipelineStage {
  const map: Record<string, PipelineStage> = {
    DRAFT:                        "DRAFT",
    APPLIED_FOR_APPROVAL:         "PROPOSAL_SUBMITTED",
    APPLIED_FOR_PRINCI_APPROVAL:  "DIRECTOR_VP_PENDING",
    UNLISTED:                     "FULLY_APPROVED",
    UPCOMING:                     "FULLY_APPROVED",
    REGISTRATION_OPEN:            "REGISTRATION_OPEN",
    REGISTRATION_CLOSED:          "REGISTRATION_CLOSED",
    ONGOING:                      "ONGOING",
    COMPLETED:                    "COMPLETED",
    TICKET_OPEN:                  "COMPLETED",
    TICKET_CLOSED:                "REPORT_SUBMITTED",
    PRIVATE:                      "COMPLETED",
  };
  return map[state] ?? "DRAFT";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformEvent(e: any): EventData {
  const state         = e.state ?? "DRAFT";
  const state_history = normalizeStateHistory(state, e.state_history ?? []);

  return {
    ...e,
    state,
    state_history,
    pipeline_stage:        mapStateToPipeline(state),
    approval_chain:        buildApprovalChain(state, state_history, e.comment),
    comment:               e.comment ?? null,
    documents:             e.documents             ?? [],
    children:              e.children              ?? [],
    tags:                  e.tags                  ?? [],
    organizer:             e.organizer             ?? { id: e.organizer_id ?? 0, name: "Unknown", photo_url: "" },
    dates:                 (e.dates ?? []).map((d: string | Date) => new Date(d).toISOString()),
    // String fields — default to empty string to prevent .replace() crashes
    event_type:            e.event_type            ?? "OTHER",
    venue:                 e.venue                 ?? "",
    banner_url:            e.banner_url            ?? "",
    long_description:      e.long_description      ?? "",
    tag_line:              e.tag_line              ?? "",
    // Number fields — default to 0
    fee:                   e.fee                   ?? 0,
    ticket_count:          e.ticket_count          ?? 0,
    tickets_sold:          e.tickets_sold          ?? 0,
    min_ppt:               e.min_ppt               ?? 1,
    ma_ppt:                e.ma_ppt                ?? 1,
    // Boolean fields
    is_only_somaiya:       e.is_only_somaiya       ?? false,
    is_feedback_enabled:   e.is_feedback_enabled   ?? false,
    is_ticket_feature_enabled: e.is_ticket_feature_enabled ?? false,
    registration_type:     e.registration_type     ?? "ONPLATFORM",
    registration_fields:   e.registration_fields   ?? [],
  } as EventData;
}

// ── User ───────────────────────────────────────────────────────────────────────

export interface CouncilUser {
  id: number;
  name: string;
  email: string;
  photo_url: string;
  role: string;
  about?: string;
  council_type?: string;
}

export async function fetchMe(): Promise<CouncilUser> {
  const res = await api.post("/user/p/me");
  return res.data.user;
}

// ── Events ─────────────────────────────────────────────────────────────────────

export async function fetchEvents(): Promise<{ list: EventData[] }> {
  const res = await api.post("/event/p/get");
  const grouped: Record<string, unknown[]> = res.data.events ?? {};
  const list = Object.values(grouped).flat().map(transformEvent);
  return { list };
}

export async function fetchEvent(id: number | string): Promise<EventData> {
  const res = await api.post(`/event/p/get/${id}`);
  return transformEvent(res.data.event);
}

export async function createEvent(data: Record<string, unknown>): Promise<EventData> {
  const res = await api.post("/event/p/create", data);
  return transformEvent(res.data.event);
}

/** Fields the backend accepts on POST /event/p/update/:id — excludes UI-only EventData props. */
const EVENT_UPDATE_KEYS = [
  "name", "description", "long_description", "tag_line", "fee", "event_type",
  "online_event_link", "dates", "venue", "ma_ppt", "min_ppt", "tags",
  "banner_url", "logo_image_url", "event_page_image_url", "parent_id",
  "is_feedback_enabled", "is_only_somaiya", "attendance_type", "registration_type",
  "external_registration_link", "is_ticket_feature_enabled", "in_event_activity",
  "start_in_event_activity", "comment", "assigned_faculty_emails", "ticket_count", "female_requirement",
  "more_details_enabled", "registration_fields", "is_submission_enabled",
  "report_url", "urls",
] as const;

export function toEventUpdatePayload(data: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const key of EVENT_UPDATE_KEYS) {
    if (data[key] !== undefined) payload[key] = data[key];
  }
  return payload;
}

export async function updateEvent(id: number | string, data: Record<string, unknown>): Promise<EventData> {
  const res = await api.post(`/event/p/update/${id}`, toEventUpdatePayload(data));
  return transformEvent(res.data.event ?? {});
}

/**
 * Transition an event to a new backend state.
 * Council-permitted transitions:
 *   DRAFT → APPLIED_FOR_APPROVAL   (Submit / Resubmit Proposal)
 *   UNLISTED / UPCOMING → REGISTRATION_OPEN (Open Registration)
 * Faculty → APPLIED_FOR_PRINCI_APPROVAL or UNLISTED (direct approve, no principal).
 * Principal → UNLISTED.
 * Faculty/Principal → DRAFT + comment (return to council for changes).
 */
export async function transitionEventState(
  id: number | string,
  newState: string,
  extra?: Record<string, unknown>,
): Promise<void> {
  await api.post(`/event/p/update/${id}`, { state: newState, ...extra });
}

// ── Statistics ─────────────────────────────────────────────────────────────────

export interface StatsItem {
  eventId: string;
  eventName: string;
  organizerId: string;
  totalParticipants: number;
  branchStats: Record<string, number>;
  genderStats: Record<string, number>;
  yearStats: Record<string, number>;
  dates: string[];
}

export async function fetchStats(): Promise<StatsItem[]> {
  const res = await api.get("/event/p/stats");
  return (res.data.data ?? []) as StatsItem[];
}

// ── Participants ───────────────────────────────────────────────────────────────

export interface ParticipantUser {
  id: number;
  name: string;
  email: string;
  phone_number?: number;
  branch?: string;
  year?: number;
  gender?: string;
  photo_url?: string;
  roll_number?: string | number;
}

export interface ParticipantRow {
  id: number;
  user: ParticipantUser;
  ticket_collected: boolean;
  attended?: boolean;
  payment_status: string;
}

export interface TeamRow {
  id: number;
  name?: string;
  leader_id: number;
  Participant: ParticipantRow[];
}

export async function fetchParticipants(eventId: number | string): Promise<TeamRow[]> {
  const res = await api.get(`/event/get-event-participants/${eventId}`);
  return res.data.teams ?? [];
}

// ── Budget ─────────────────────────────────────────────────────────────────────

export interface BudgetEntry {
  id: number;
  event_id: number;
  category: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
}

export interface BudgetSummary { income: number; expense: number; net: number }

export async function fetchBudget(eventId: number | string): Promise<{ items: BudgetEntry[]; summary: BudgetSummary }> {
  const res = await api.get(`/budget/p/${eventId}`);
  return res.data;
}

export async function addBudgetItem(data: {
  event_id: number;
  category: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date?: string;
}): Promise<BudgetEntry> {
  const res = await api.post("/budget/p", data);
  return res.data.item;
}

export async function deleteBudgetItem(itemId: number | string): Promise<void> {
  await api.delete(`/budget/p/${itemId}`);
}

// ── Announcements ──────────────────────────────────────────────────────────────

export interface AnnouncementRow {
  id: number;
  event_id: number;
  title: string;
  body: string;
  channel: "EMAIL" | "PUSH" | "BOTH";
  recipient_count: number;
  sent_at: string;
  created_by?: { name: string; photo_url: string };
}

export async function fetchAnnouncements(eventId: number | string): Promise<AnnouncementRow[]> {
  const res = await api.get(`/announcement/p/${eventId}`);
  return res.data.announcements ?? [];
}

export async function sendAnnouncement(data: {
  event_id: number;
  title: string;
  body: string;
  channel: "EMAIL" | "PUSH" | "BOTH";
  body_format?: "plain" | "markdown" | "html";
}): Promise<{ announcement: AnnouncementRow; recipients_queued: number }> {
  const res = await api.post("/announcement/p", data);
  return res.data;
}

export async function deleteAnnouncement(announcementId: number | string): Promise<void> {
  await api.delete(`/announcement/p/${announcementId}`);
}

// ── Documents ──────────────────────────────────────────────────────────────────

export interface DocumentRow {
  id: number;
  event_id: number;
  name: string;
  type: string;
  url: string;
  required: boolean;
  uploaded_at: string;
}

export async function fetchDocuments(eventId: number | string): Promise<DocumentRow[]> {
  const res = await api.get(`/document/p/${eventId}`);
  return res.data.documents ?? [];
}

export async function addDocument(data: {
  event_id: number;
  name: string;
  type: string;
  url: string;
  required?: boolean;
}): Promise<DocumentRow> {
  const res = await api.post("/document/p", data);
  return res.data.document;
}

export async function deleteDocument(docId: number | string): Promise<void> {
  await api.delete(`/document/p/${docId}`);
}

// ── Council profile ────────────────────────────────────────────────────────────

export interface CouncilMemberRow {
  id: number;
  council_id: number;
  name: string;
  email: string;
  role: string;
  team: string;
  is_head: boolean;
  photo_url: string | null;
  created_at: string;
}

export interface FacultyAdvisorRow {
  id: number;
  council_id: number;
  name: string;
  email: string;
  dept: string;
  designation: string;
  created_at: string;
}

export interface CouncilProfile {
  id: number;
  name: string;
  email: string;
  photo_url: string;
  phone_number?: string | null;
  about?: string;
  council_type?: string;
  profile?: {
    id?: number;
    tagline?: string;
    about?: string;
    banner_url?: string;
    letterhead_logo?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
    members?: CouncilMemberRow[];
    faculty_advisors?: FacultyAdvisorRow[];
  };
}

export async function fetchCouncilProfile(): Promise<CouncilProfile> {
  const res = await api.get("/council/p/me");
  return res.data.council ?? res.data;
}

export async function updateCouncilProfile(data: Record<string, unknown>): Promise<CouncilProfile> {
  const res = await api.put("/council/p/me", data);
  return res.data.council ?? res.data;
}

// ── Member CRUD ────────────────────────────────────────────────────────────────

export async function createMember(data: {
  name: string; email: string; role?: string; team?: string; is_head?: boolean; photo_url?: string;
}): Promise<CouncilMemberRow> {
  const res = await api.post("/council/p/members", data);
  return res.data.member;
}

export async function updateMember(id: number, data: Partial<Omit<CouncilMemberRow, "id" | "council_id" | "created_at">>): Promise<CouncilMemberRow> {
  const res = await api.put(`/council/p/members/${id}`, data);
  return res.data.member;
}

export async function deleteMember(id: number): Promise<void> {
  await api.delete(`/council/p/members/${id}`);
}

// ── Faculty Advisor CRUD ───────────────────────────────────────────────────────

export async function createAdvisor(data: {
  name: string; email: string; dept?: string; designation?: string;
}): Promise<FacultyAdvisorRow> {
  const res = await api.post("/council/p/advisors", data);
  return res.data.advisor;
}

export async function updateAdvisor(id: number, data: Partial<Omit<FacultyAdvisorRow, "id" | "council_id" | "created_at">>): Promise<FacultyAdvisorRow> {
  const res = await api.put(`/council/p/advisors/${id}`, data);
  return res.data.advisor;
}

export async function deleteAdvisor(id: number): Promise<void> {
  await api.delete(`/council/p/advisors/${id}`);
}

// ── Event Controls ─────────────────────────────────────────────────────────────

export interface EventControlStats {
  total: number;
  paid: number;
  pending: number;
  ticketed: number;
  attended: number;
  ticket_count: number | null;
}

/** Fetch live participant/ticket stats for the controls panel */
export async function fetchEventStats(eventId: number | string): Promise<EventControlStats> {
  const res = await api.get(`/event/p/event-stats/${eventId}`);
  return res.data.stats;
}

/** Issue tickets to the first `count` paid participants (omit count = all eligible) */
export async function bulkIssueTickets(
  eventId: number | string,
  count?: number,
): Promise<{ issued: number }> {
  const res = await api.post("/event/p/bulk-issue-tickets", {
    event_id: Number(eventId),
    ...(count !== undefined ? { count } : {}),
  });
  return { issued: res.data.issued ?? 0 };
}

/** Mark the first `count` PENDING participants as manually paid */
export async function bulkMarkPaid(
  eventId: number | string,
  count?: number,
  participantIds?: number[],
): Promise<{ updated: number }> {
  const res = await api.post("/event/p/bulk-mark-paid", {
    event_id: Number(eventId),
    ...(count !== undefined ? { count } : {}),
    ...(participantIds ? { participant_ids: participantIds } : {}),
  });
  return { updated: res.data.updated ?? 0 };
}

/** Update specific event settings (fee, cap, toggles, etc.) without changing state */
export async function updateEventSettings(
  eventId: number | string,
  settings: {
    ticket_count?: number | null;
    fee?: number;
    is_only_somaiya?: boolean;
    is_ticket_feature_enabled?: boolean;
    is_feedback_enabled?: boolean;
    more_details_enabled?: boolean;
    registration_fields?: import("./registration-fields").RegistrationField[];
    is_submission_enabled?: boolean;
    registration_type?: string;
    external_registration_link?: string;
    ma_ppt?: number;
    min_ppt?: number;
  },
): Promise<void> {
  await api.post(`/event/p/update/${eventId}`, settings);
}

/** Download participants as CSV — triggers browser download dialog */
export async function downloadParticipantsCsv(
  eventId: number | string,
  eventName?: string,
): Promise<void> {
  const res = await api.get(`/event/p/export-participants/${eventId}`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(eventName ?? "event").replace(/\s+/g, "_")}-participants.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Mark a participant as attended (check-in via QR or manual) */
export async function checkinParticipant(
  eventId: number,
  participantId: number,
): Promise<void> {
  await api.post("/event/checkin", {
    event_id: eventId,
    participant_id: participantId,
  });
}

/** Revert a check-in (mark participant as absent) */
export async function uncheckinParticipant(
  eventId: number,
  participantId: number,
): Promise<void> {
  await api.post("/event/uncheckin", {
    event_id: eventId,
    participant_id: participantId,
  });
}
