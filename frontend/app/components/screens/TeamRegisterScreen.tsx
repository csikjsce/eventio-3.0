"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Add, Login } from "iconsax-react";
import { TeamPageSkeleton } from "@/components/Skeletons";
import Spinner from "@/components/Spinner";
import MoreDetailsForm from "@/components/MoreDetailsForm";
import TeamEventHeader from "@/components/team/TeamEventHeader";
import {
  fetchEvent,
  createTeam as apiCreateTeam,
  joinTeam as apiJoinTeam,
} from "@/lib/api";
import type { EventData } from "@/types/eventio";
import {
  buildInitialAnswers,
  validateClientAnswers,
} from "@/lib/registration-fields";

const INPUT =
  "w-full h-12 bg-surface border border-border rounded-xl px-4 text-foreground font-poppins text-sm outline-none focus:border-primary/50 placeholder:text-mute transition-colors";

export default function TeamRegisterScreen() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [choice, setChoice] = useState<"create" | "join" | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const registrationFields = useMemo(
    () =>
      event?.more_details_enabled && event.registration_fields?.length
        ? event.registration_fields
        : [],
    [event],
  );

  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const eventData = await fetchEvent(Number(id));
        if (eventData) {
          setEvent(eventData);
          if (
            eventData.Participant &&
            (eventData.Participant as { team?: unknown }).team
          ) {
            router.push(`/team-details/${id}`);
          }
        }
      } catch {
        /* handled by interceptor */
      }
    }
    load();
  }, [id, router]);

  useEffect(() => {
    if (registrationFields.length) {
      setFormData(buildInitialAnswers(registrationFields));
    }
  }, [registrationFields]);

  const createTeam = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (registrationFields.length) {
      const validationError = validateClientAnswers(registrationFields, formData);
      if (validationError) {
        setFormError(validationError);
        return;
      }
    }
    setFormError(null);
    setLoading(true);
    const teamName = (e.target as HTMLFormElement).team_name.value;
    try {
      const server = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
      if (server && localStorage.getItem("accessToken")) {
        const moreDetails =
          registrationFields.length > 0 ? formData : undefined;
        await apiCreateTeam(Number(id), teamName, moreDetails);
      }
      router.push(`/team-details/${id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create team";
      setSnackbarMessage(msg);
      setSnackbarVisible(true);
      setTimeout(() => setSnackbarVisible(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (registrationFields.length) {
      const validationError = validateClientAnswers(registrationFields, formData);
      if (validationError) {
        setFormError(validationError);
        return;
      }
    }
    setFormError(null);
    setLoading(true);
    const inviteCode = (e.target as HTMLFormElement).invite_code.value;
    try {
      const server = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
      if (server && localStorage.getItem("accessToken")) {
        const moreDetails =
          registrationFields.length > 0 ? formData : undefined;
        await apiJoinTeam(Number(id), inviteCode, moreDetails);
      }
      router.push(`/team-details/${id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Invalid invite code";
      setSnackbarMessage(msg);
      setSnackbarVisible(true);
      setTimeout(() => setSnackbarVisible(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!event) return <TeamPageSkeleton variant="register" />;

  if (event.ma_ppt === 1) {
    router.push(`/event-details/${id}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <TeamEventHeader event={event} eventId={id} title="Team registration" />

      <div className="px-5 pt-5 flex flex-col gap-5 max-w-lg mx-auto w-full">
        {registrationFields.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-mute text-[11px] font-poppins font-semibold uppercase tracking-wider mb-3">
              Additional info
            </p>
            <MoreDetailsForm
              fields={registrationFields}
              values={formData}
              onChange={setFormData}
            />
            {formError && (
              <p className="text-red-500 text-sm font-poppins mt-3">{formError}</p>
            )}
          </div>
        )}

        {!choice && (
          <>
            <p className="text-mute text-sm font-poppins leading-relaxed">
              Register as a team for this event. Create a new team and share an invite code, or join an existing team.
            </p>
            <button
              type="button"
              onClick={() => setChoice("create")}
              className="flex items-center gap-3 w-full bg-primary text-white rounded-2xl px-4 py-4 text-left active:scale-[0.99] transition-transform"
            >
              <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Add size={22} color="white" />
              </span>
              <span>
                <span className="block font-poppins font-semibold text-base">Create a team</span>
                <span className="block text-white/80 text-xs font-poppins mt-0.5">You&apos;ll get an invite code to share</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setChoice("join")}
              className="flex items-center gap-3 w-full bg-card border border-border rounded-2xl px-4 py-4 text-left active:scale-[0.99] transition-transform"
            >
              <span className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0">
                <Login size={22} color="currentColor" className="text-foreground" />
              </span>
              <span>
                <span className="block font-poppins font-semibold text-foreground text-base">Join a team</span>
                <span className="block text-mute text-xs font-poppins mt-0.5">Enter the 5-character invite code</span>
              </span>
            </button>
          </>
        )}

        {choice === "join" && (
          <form onSubmit={joinTeam} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-poppins font-semibold text-foreground">Join with invite code</p>
              <button
                type="button"
                className="text-mute text-xs font-poppins"
                onClick={() => setChoice(null)}
              >
                Back
              </button>
            </div>
            <input
              type="text"
              name="invite_code"
              placeholder="e.g. CW26X"
              required
              minLength={5}
              maxLength={5}
              className={`${INPUT} font-mono tracking-widest uppercase`}
            />
            <button
              type="submit"
              className="w-full h-12 bg-primary text-white rounded-xl font-poppins font-semibold text-sm flex items-center justify-center disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <Spinner /> : "Join team"}
            </button>
          </form>
        )}

        {choice === "create" && (
          <form onSubmit={createTeam} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-poppins font-semibold text-foreground">Name your team</p>
              <button
                type="button"
                className="text-mute text-xs font-poppins"
                onClick={() => setChoice(null)}
              >
                Back
              </button>
            </div>
            <input
              type="text"
              name="team_name"
              placeholder="e.g. Code Warriors"
              required
              minLength={3}
              className={INPUT}
            />
            <button
              type="submit"
              className="w-full h-12 bg-primary text-white rounded-xl font-poppins font-semibold text-sm flex items-center justify-center disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <Spinner /> : "Create team"}
            </button>
          </form>
        )}
      </div>

      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 max-w-[calc(100%-2rem)] bg-foreground text-background text-center font-poppins text-sm px-4 py-3 rounded-xl z-40 shadow-lg transition-all duration-300 ${snackbarVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        {snackbarMessage}
      </div>
    </div>
  );
}
