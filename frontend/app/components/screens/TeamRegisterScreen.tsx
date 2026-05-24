"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TeamPageSkeleton } from "@/components/Skeletons";
import Spinner from "@/components/Spinner";
import { fetchEvent, createTeam as apiCreateTeam, joinTeam as apiJoinTeam } from "@/lib/api";
import type { EventData } from "@/types/eventio";

interface FormData {
  linkedin: string;
  github: string;
  techStack: string;
  whyHackathon: string;
}

export default function TeamRegisterScreen() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [choice, setChoice] = useState<"create" | "join" | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [formData, setFormData] = useState<FormData>({
    linkedin: "",
    github: "",
    techStack: "",
    whyHackathon: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    async function load() {
      try {
        const eventData = await fetchEvent(Number(id));
        if (eventData) {
          setEvent(eventData);
          if (eventData.Participant && (eventData.Participant as { team?: unknown }).team) {
            router.push(`/team-details/${id}`);
          }
        }
      } catch { /* handled by interceptor */ }
    }
    load();
  }, [id, router]);

  const createTeam = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const teamName = (e.target as HTMLFormElement).team_name.value;
    try {
      const server = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
      if (server && localStorage.getItem("accessToken")) {
        const moreDetails = event?.more_details_enabled ? formData : undefined;
        await apiCreateTeam(Number(id), teamName, moreDetails);
      }
      router.push(`/team-details/${id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to create team";
      setSnackbarMessage(msg);
      setSnackbarVisible(true);
      setTimeout(() => setSnackbarVisible(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const inviteCode = (e.target as HTMLFormElement).invite_code.value;
    try {
      const server = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
      if (server && localStorage.getItem("accessToken")) {
        const moreDetails = event?.more_details_enabled ? formData : undefined;
        await apiJoinTeam(Number(id), inviteCode, moreDetails);
      }
      router.push(`/team-details/${id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Invalid invite code";
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

      {event.more_details_enabled && (
        <form onSubmit={handleSubmit} className="space-y-4 mt-5 mb-6">
          <div>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="LinkedIn Profile URL"
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-400 border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="url"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="GitHub Profile URL"
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-400 border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="text"
              name="techStack"
              value={formData.techStack}
              onChange={handleChange}
              placeholder="Tech Stack (e.g., React, Node.js, Python)"
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-400 border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <textarea
              name="whyHackathon"
              value={formData.whyHackathon}
              onChange={handleChange}
              placeholder="Why do you want to participate in this hackathon?"
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-400 border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none resize-none"
            />
          </div>
        </form>
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
