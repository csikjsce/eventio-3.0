/**
 * Centralised Axios client for the Eventio student app.
 *
 * • Attaches the access token from localStorage on every request.
 * • On a 401, attempts one silent token refresh then retries.
 * • Redirects to /login if the refresh also fails.
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const SERVER = process.env.NEXT_PUBLIC_SERVER_ADDRESS ?? "";

// ── Axios instance ────────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: `${SERVER}/api/v1`,
  withCredentials: false,
  timeout: 15_000,
});

// ── Request interceptor — attach access token ─────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Session cleanup + safe login redirect ─────────────────────────────────────

/**
 * Clear the stored session and send the user to /login.
 *
 * Always clears the tokens first — a leftover accessToken is what caused the
 * infinite loop: an invalid token kept re-triggering this 401 handler on every
 * render, nesting ?next= forever. Also refuses to redirect when the request
 * already originated on /login, so we never build a /login?next=/login chain.
 */
function redirectToLogin() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("eventio-onboarded");
  if (window.location.pathname === "/login") return;
  const next = window.location.pathname + window.location.search;
  window.location.replace("/login?next=" + encodeURIComponent(next));
}

// ── Response interceptor — silent refresh on 401 ─────────────────────────────

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const config = err.config as RetryableConfig | undefined;

    if (err.response?.status === 401 && config && !config._retry) {
      config._retry = true;

      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refreshToken")
          : null;

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${SERVER}/api/v1/auth/refresh-token`,
            { refreshToken },
          );
          const newToken: string = data.accessToken;
          localStorage.setItem("accessToken", newToken);
          config.headers.Authorization = `Bearer ${newToken}`;
          return api.request(config);
        } catch {
          // Refresh failed — clear session and go to login
          redirectToLogin();
        }
      } else {
        // No refresh token at all — clear session and go to login
        redirectToLogin();
      }
    }

    return Promise.reject(err);
  },
);

// ── Auth helpers ──────────────────────────────────────────────────────────────

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("accessToken");
}

export function logout(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("eventio-onboarded");
  window.location.replace("/login");
}

// ── Typed API calls ───────────────────────────────────────────────────────────

/** Fetch the logged-in user's profile */
export async function fetchMe() {
  const { data } = await api.post("/user/p/me");
  return data.user;
}

/** Fetch all visible events grouped by state */
export async function fetchEvents() {
  const { data } = await api.post("/event/p/get");
  return data.events; // { UPCOMING: [], REGISTRATION_OPEN: [], ... }
}

/** Fetch a single event by id */
export async function fetchEvent(id: number) {
  const { data } = await api.post(`/event/p/get/${id}`);
  return data.event;
}

/** Fetch events the current user is registered for */
export async function fetchMyEvents() {
  const { data } = await api.post("/event/p/get/me");
  // Returns an array of Participant rows with event nested
  return (data.events as { event: unknown }[]).map((p) => p.event);
}

/** Register for a solo event */
export async function registerForEvent(eventId: number, moreDetails?: unknown) {
  const { data } = await api.post("/event/p/register-for-event", {
    event_id: eventId,
    ...(moreDetails !== undefined ? { more_details: moreDetails } : {}),
  });
  return data;
}

/** Claim ticket / RSVP */
export async function claimTicket(eventId: number) {
  const { data } = await api.post("/event/p/claim-ticket", {
    event_id: eventId,
  });
  return data;
}

/** Rate a completed event (1–5) */
export async function rateEvent(eventId: number, rating: number) {
  const { data } = await api.post("/event/p/rate", {
    event_id: eventId,
    rating,
  });
  return data;
}

/** Create a team */
export async function createTeam(
  eventId: number,
  teamName: string,
  moreDetails?: unknown,
) {
  const { data } = await api.post("/event/p/create-team", {
    event_id: eventId,
    team_name: teamName,
    ...(moreDetails !== undefined ? { more_details: moreDetails } : {}),
  });
  return data;
}

/** Join a team with an invite code */
export async function joinTeam(
  eventId: number,
  inviteCode: string,
  moreDetails?: unknown,
) {
  const { data } = await api.post("/event/p/join-team", {
    event_id: eventId,
    invite_code: inviteCode,
    ...(moreDetails !== undefined ? { more_details: moreDetails } : {}),
  });
  return data;
}

/** Delete own team (leader only) */
export async function deleteTeam(eventId: number, teamId: number) {
  const { data } = await api.post("/event/p/delete-team", {
    event_id: eventId,
    team_id: teamId,
  });
  return data;
}

export interface SearchResult {
  id: number;
  name: string;
  tag_line: string;
  description: string;
  banner_url: string;
  logo_image__url: string;
  venue: string;
  state: string;
  event_type: string;
  fee: number;
  dates: string[];
  is_only_somaiya: boolean;
  registration_type: string;
  organizer: { id: number; name: string; photo_url: string };
}

/** Search events by name / description / tag_line */
export async function searchEvents(q: string): Promise<SearchResult[]> {
  const { data } = await api.get("/event/p/search/", { params: { q } });
  return (data.events ?? []) as SearchResult[];
}

/** Fetch all councils */
export async function fetchCouncils() {
  const { data } = await api.post("/council/p/get");
  return data.councils;
}

/** Fetch a single council's public profile + events */
export async function fetchCouncilProfile(id: number) {
  const { data } = await api.get(`/council/p/profile/${id}`);
  return data.council;
}

/** Submit onboarding profile update */
export async function updateProfile(payload: Partial<{
  name: string;
  phone_number: string;
  roll_number: string;
  gender: string;
  year: number;
  branch: string;
  degree: string;
  college: string;
  about: string;
  interests: string[];
  photo_url: string;
}>) {
  const { data } = await api.post("/user/p/update", {
    ...payload,
    phone_number:
      payload.phone_number === undefined
        ? undefined
        : payload.phone_number.trim() || null,
  });
  return data;
}

export async function submitOnboarding(payload: {
  phone_number: string;
  gender: string;
  year: string;
  branch: string;
  degree: string;
  college: string;
  roll_number?: string;
  interests: string[];
  signature?: unknown;
}) {
  const rollNumber = payload.roll_number?.trim();
  const { data } = await api.post("/user/p/update", {
    phone_number: payload.phone_number.trim() || null,
    gender: payload.gender,
    year: parseInt(payload.year),
    branch: payload.branch,
    degree: payload.degree,
    college: payload.college,
    ...(rollNumber ? { roll_number: rollNumber } : {}),
    interests: payload.interests,
    signature: payload.signature ?? {},
  });
  return data;
}
