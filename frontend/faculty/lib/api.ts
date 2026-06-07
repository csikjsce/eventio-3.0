import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type {
  ApprovalStep, BudgetItem, CalendarEvent, EventData,
  EventDocument, FacultyUser, StatsItem,
} from "@/lib/types";

const SERVER = process.env.NEXT_PUBLIC_SERVER_ADDRESS ?? "https://eventioapi.swdc.somaiya.edu";

export const api = axios.create({
  baseURL: `${SERVER}/api/v1`,
  timeout: 15_000,
});

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function getAccessToken() {
  return typeof window !== "undefined" ? localStorage.getItem("faculty_accessToken") : null;
}

function getRefreshToken() {
  return typeof window !== "undefined" ? localStorage.getItem("faculty_refreshToken") : null;
}

export function logout() {
  localStorage.removeItem("faculty_accessToken");
  localStorage.removeItem("faculty_refreshToken");
  window.location.replace("/login");
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const config = err.config as RetryableConfig | undefined;
    if (err.response?.status !== 401 || !config || config._retry) {
      return Promise.reject(err);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      logout();
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          config.headers.Authorization = `Bearer ${token}`;
          resolve(api.request(config));
        });
      });
    }

    config._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${SERVER}/api/v1/auth/refresh-token`, { refreshToken });
      const newToken: string = data.accessToken;
      localStorage.setItem("faculty_accessToken", newToken);
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];
      config.headers.Authorization = `Bearer ${newToken}`;
      return api.request(config);
    } catch {
      refreshQueue = [];
      logout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

// ── Approval chain from state_history ─────────────────────────────────────────

interface StateMeta {
  label:       string;
  reopenLabel?: string;
  actor:       string;
}

const STATE_META: Record<string, StateMeta> = {
  DRAFT:                       { label: "Event Created",         actor: "Council"         },
  APPLIED_FOR_APPROVAL:        { label: "Proposal Submitted",    actor: "Council"         },
  APPLIED_FOR_PRINCI_APPROVAL: { label: "Faculty Cleared",       actor: "Faculty Advisor" },
  UNLISTED:                    { label: "Principal Approved",    actor: "Principal"       },
  UPCOMING:                    { label: "Event Listed",          reopenLabel: "Event Re-listed",         actor: "Council" },
  REGISTRATION_OPEN:           { label: "Registration Opened",   reopenLabel: "Registration Reopened", actor: "Council" },
  REGISTRATION_CLOSED:         { label: "Registration Closed",     reopenLabel: "Registration Paused",     actor: "Council" },
  TICKET_OPEN:                 { label: "Tickets Live",          reopenLabel: "Tickets Reopened",      actor: "Council" },
  TICKET_CLOSED:               { label: "Ticket Sales Closed",   reopenLabel: "Ticket Sales Stopped",  actor: "Council" },
  ONGOING:                     { label: "Event Started",         actor: "Council"         },
  COMPLETED:                   { label: "Event Completed",       actor: "Council"         },
  PRIVATE:                     { label: "Set to Private",        actor: "Council"         },
};

function normalizeStateHistory(currentState: string, stateHistory?: string[]): string[] {
  const history = (stateHistory ?? []).filter(Boolean).map(String);
  const state   = currentState || "DRAFT";
  if (history.length === 0) return [state];
  if (history[history.length - 1] !== state) return [...history, state];
  return history;
}

function buildApprovalChain(currentState: string, stateHistory: string[], comment?: string | null): ApprovalStep[] {
  const history    = normalizeStateHistory(currentState, stateHistory);
  const visitCount: Record<string, number> = {};

  const chain: ApprovalStep[] = history.map((stage, index) => {
    visitCount[stage] = (visitCount[stage] ?? 0) + 1;
    const meta     = STATE_META[stage] ?? {
      label: stage.replace(/_/g, " "),
      actor: "System",
    };
    const isLast   = index === history.length - 1;
    const isRepeat = visitCount[stage] > 1;
    const label    = isRepeat && meta.reopenLabel
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformEvent(e: any): EventData {
  const state         = e.state ?? "DRAFT";
  const state_history = normalizeStateHistory(state, e.state_history ?? []);

  return {
    ...e,
    state,
    state_history,
    approval_chain: buildApprovalChain(state, state_history, e.comment),
    comment:        e.comment ?? null,
    dates:          (e.dates ?? []).map((d: string | Date) => new Date(d).toISOString()),
    organizer:      e.organizer ?? { id: e.organizer_id ?? 0, name: "Unknown Council" },
    banner_url:     e.banner_url ?? e.event_page_image_url ?? "",
    description:    e.description ?? "",
    long_description: e.long_description ?? "",
    event_type:     e.event_type ?? "OTHER",
    venue:          e.venue ?? "",
    fee:            e.fee ?? 0,
    ticket_count:   e.ticket_count ?? 0,
    tickets_sold:   e.tickets_sold ?? 0,
    min_ppt:        e.min_ppt ?? 1,
    ma_ppt:         e.ma_ppt ?? 1,
    children:       e.children ?? [],
  } as EventData;
}

// ── Auth / user ───────────────────────────────────────────────────────────────

export async function fetchMe(): Promise<FacultyUser> {
  const res = await api.post("/user/p/me");
  return res.data.user;
}

export async function updateProfile(data: {
  name?: string;
  phone_number?: string | null;
  photo_url?: string;
  about?: string | null;
  signature?: unknown;
}): Promise<void> {
  await api.post("/user/p/update", data);
}

// ── Events ────────────────────────────────────────────────────────────────────

export async function fetchEvents(): Promise<EventData[]> {
  const res = await api.post("/event/p/get");
  const grouped: Record<string, unknown[]> = res.data.events ?? {};
  return Object.values(grouped).flat().map(transformEvent);
}

export async function fetchEvent(id: number | string): Promise<EventData> {
  const res = await api.post(`/event/p/get/${id}`);
  return transformEvent(res.data.event);
}

export async function searchEvents(q: string): Promise<EventData[]> {
  const res = await api.get(`/event/p/search/?q=${encodeURIComponent(q)}`);
  return (res.data.events ?? []).map(transformEvent);
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const res = await api.post("/event/p/get-calendar");
  return (res.data.events ?? []).map((e: CalendarEvent) => ({
    ...e,
    dates: (e.dates ?? []).map((d) => new Date(d).toISOString()),
  }));
}

export async function transitionEventState(
  id: number | string,
  newState: string,
  comment?: string | null,
): Promise<void> {
  await api.post(`/event/p/update/${id}`, {
    state: newState,
    ...(comment !== undefined ? { comment } : {}),
  });
}

/** Approve event — faculty can skip principal and go straight to UNLISTED. */
export async function approveEvent(
  id: number | string,
  options: { sendToPrincipal: boolean; isPrincipal: boolean },
): Promise<void> {
  const newState = options.isPrincipal
    ? "UNLISTED"
    : options.sendToPrincipal
      ? "APPLIED_FOR_PRINCI_APPROVAL"
      : "UNLISTED";
  await transitionEventState(id, newState, null);
}

/** Send event back to council in DRAFT with required feedback for changes. */
export async function returnEventToCouncil(
  id: number | string,
  feedback: string,
): Promise<void> {
  await transitionEventState(id, "DRAFT", feedback.trim());
}

// ── Documents & budget ────────────────────────────────────────────────────────

export async function fetchDocuments(eventId: number | string): Promise<EventDocument[]> {
  const res = await api.get(`/document/p/${eventId}`);
  return res.data.documents ?? [];
}

export async function fetchBudget(eventId: number | string): Promise<BudgetItem[]> {
  const res = await api.get(`/budget/p/${eventId}`);
  return res.data.items ?? [];
}

// ── Statistics ────────────────────────────────────────────────────────────────

export async function fetchStats(): Promise<StatsItem[]> {
  const res = await api.get("/event/p/stats");
  return (res.data.data ?? []) as StatsItem[];
}

export function attendanceReportUrl(eventId: number | string): string {
  const token = getAccessToken();
  return `${SERVER}/api/v1/event/p/attendance-report/${eventId}?token=${token}`;
}
