import axios from "axios";
import type { EventData, PipelineStage } from "@/lib/dummy-data";

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

// ── Approval chain builder ─────────────────────────────────────────────────────

interface RawApprovalStep {
  stage: string;
  label: string;
  actor: string;
}

const CHAIN_MILESTONES: RawApprovalStep[] = [
  { stage: "DRAFT",                       label: "Event Created",                   actor: "You (Council)"             },
  { stage: "APPLIED_FOR_APPROVAL",        label: "Proposal Submitted",              actor: "You (Council)"             },
  { stage: "APPLIED_FOR_PRINCI_APPROVAL", label: "Faculty Cleared — With Principal", actor: "Faculty Advisor"          },
  { stage: "UNLISTED",                    label: "Principal Approved",              actor: "Principal"                 },
  { stage: "UPCOMING",                    label: "Event Listed",                    actor: "System"                    },
  { stage: "REGISTRATION_OPEN",           label: "Registration Opened",             actor: "You (Council)"             },
  { stage: "REGISTRATION_CLOSED",         label: "Registration Closed",             actor: "You (Council)"             },
  { stage: "ONGOING",                     label: "Event Started",                   actor: "You (Council)"             },
  { stage: "COMPLETED",                   label: "Event Completed",                 actor: "System"                    },
  { stage: "TICKET_OPEN",                 label: "Tickets Opened",                  actor: "You (Council)"             },
  { stage: "TICKET_CLOSED",               label: "Report Submitted",                actor: "You (Council)"             },
  { stage: "REJECTED",                    label: "Proposal Rejected",               actor: "Faculty / Principal"       },
];

// Matches dean-portal approval flow (faculty → principal → council)
const CANONICAL_ORDER = [
  "DRAFT",
  "APPLIED_FOR_APPROVAL",
  "APPLIED_FOR_PRINCI_APPROVAL",
  "UNLISTED",
  "UPCOMING",
  "REGISTRATION_OPEN",
  "REGISTRATION_CLOSED",
  "ONGOING",
  "COMPLETED",
  "TICKET_OPEN",
  "TICKET_CLOSED",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildApprovalChain(currentState: string, stateHistory: string[]): any[] {
  const raw = Array.isArray(stateHistory) ? stateHistory : [];

  // Determine the working history:
  //   • If state_history already includes the current state, it's a full record — use it.
  //   • Otherwise the record is missing/incomplete (legacy event or direct DB edit).
  //     Reconstruct the canonical path up to the current state so the timeline shows
  //     all expected steps rather than just the last one.
  let history: string[];

  if (raw.includes(currentState)) {
    // Drop duplicate/backward jumps from manual re-clicks
    history = raw.filter((s, i, arr) => i === 0 || s !== arr[i - 1]);
  } else if (currentState === "REJECTED") {
    // For rejected events reconstruct up to the point of rejection
    const lastKnown = raw.filter(s => CANONICAL_ORDER.includes(s));
    history = lastKnown.length
      ? [...lastKnown, "REJECTED"]
      : ["DRAFT", "APPLIED_FOR_APPROVAL", "REJECTED"];
  } else {
    const idx = CANONICAL_ORDER.indexOf(currentState);
    history = idx >= 0
      ? CANONICAL_ORDER.slice(0, idx + 1)   // every step from DRAFT up to (and including) current
      : raw.length ? raw : [currentState];
  }

  const chain = [];
  for (let i = 0; i < history.length; i++) {
    const s = history[i];
    const milestone = CHAIN_MILESTONES.find(m => m.stage === s);
    if (!milestone) continue;

    const isLast = i === history.length - 1;
    const status =
      s === "REJECTED" ? "rejected" :
      isLast           ? "active"   :
                         "done";

    chain.push({ stage: s, label: milestone.label, status, actor: milestone.actor });
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
  return {
    ...e,
    pipeline_stage:        mapStateToPipeline(e.state ?? "DRAFT"),
    approval_chain:        (e.approval_chain && e.approval_chain.length)
                             ? e.approval_chain
                             : buildApprovalChain(e.state ?? "DRAFT", e.state_history ?? []),
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

export async function updateEvent(id: number | string, data: Record<string, unknown>): Promise<EventData> {
  const res = await api.post(`/event/p/update/${id}`, data);
  return transformEvent(res.data.event ?? {});
}

/**
 * Transition an event to a new backend state.
 * Council-permitted transitions:
 *   DRAFT → APPLIED_FOR_APPROVAL   (Submit Proposal)
 *   UNLISTED / UPCOMING → REGISTRATION_OPEN (Open Registration)
 * Faculty → APPLIED_FOR_PRINCI_APPROVAL and Principal → UNLISTED happen in the dean portal.
 */
export async function transitionEventState(
  id: number | string,
  newState: string,
): Promise<void> {
  await api.post(`/event/p/update/${id}`, { state: newState });
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

export interface CouncilProfile {
  id: number;
  name: string;
  email: string;
  photo_url: string;
  about?: string;
  council_type?: string;
  profile?: {
    tagline?: string;
    about?: string;
    banner_url?: string;
    instagram?: string;
    website?: string;
    faculty_advisors?: unknown[];
    members?: unknown[];
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
