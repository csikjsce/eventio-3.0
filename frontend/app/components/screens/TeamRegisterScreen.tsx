"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TeamPageSkeleton } from "@/components/Skeletons";
import Spinner from "@/components/Spinner";
import MoreDetailsForm from "@/components/MoreDetailsForm";
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

  if (!event) return <TeamPageSkeleton />;

  if (event.ma_ppt === 1) {
    router.push(`/event-details/${id}`);
    return null;
  }

  return (
    <div className="p-4 text-foreground font-fira mb-20">
      <div className="flex justify-between items-center">
        <div className="font-marcellus">
          <p className="text-2xl">{event.name}</p>
          <p className="text-md text-mute">{event.description}</p>
        </div>
        <img
          src={event.event_page_image_url}
          alt={event.name}
          className="w-20 h-20 rounded-lg object-cover"
        />
      </div>

      {registrationFields.length > 0 && (
        <div className="mt-5 mb-6">
          <p className="text-sm text-mute mb-3">Additional registration info</p>
          <MoreDetailsForm
            fields={registrationFields}
            values={formData}
            onChange={setFormData}
          />
          {formError && (
            <p className="text-red-400 text-sm mt-2">{formError}</p>
          )}
        </div>
      )}

      <div
        className="mt-6 flex justify-center items-center h-12 bg-primary text-white rounded-full hover:cursor-pointer active:bg-primary/70"
        onClick={() => setChoice("create")}
      >
        Create Team
      </div>
      <div
        className="mt-4 flex justify-center items-center h-12 bg-card rounded-full hover:cursor-pointer active:bg-card/70"
        onClick={() => setChoice("join")}
      >
        Join Team
      </div>
      {choice === "join" && (
        <form onSubmit={joinTeam}>
          <input
            type="text"
            name="invite_code"
            placeholder="Enter invite code (try CW26X)"
            required
            minLength={5}
            maxLength={5}
            className="mt-6 flex w-full h-12 bg-transparent border-b border-mute focus:outline-none p-4"
          />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-card/90 p-2 rounded-full text-sm"
              disabled={loading}
            >
              {loading ? <Spinner /> : "Submit"}
            </button>
          </div>
        </form>
      )}
      {choice === "create" && (
        <form onSubmit={createTeam}>
          <input
            type="text"
            name="team_name"
            placeholder="Enter team name"
            required
            className="mt-6 flex w-full h-12 bg-transparent border-b border-mute focus:outline-none p-4"
            minLength={3}
          />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-card/90 p-2 rounded-full text-sm"
              disabled={loading}
            >
              {loading ? <Spinner /> : "Submit"}
            </button>
          </div>
        </form>
      )}
      <div
        className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 w-64 bg-primary text-center text-white p-4 rounded-md z-40 transition-all duration-500 ease-in-out ${snackbarVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
      >
        {snackbarMessage}
      </div>
    </div>
  );
}
