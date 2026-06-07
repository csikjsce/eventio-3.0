"use client";

import { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Copy, TickCircle, Trash } from "iconsax-react";
import { UserDataContext } from "@/contexts/userContext";
import { TeamPageSkeleton } from "@/components/Skeletons";
import Spinner from "@/components/Spinner";
import TeamEventHeader from "@/components/team/TeamEventHeader";
import { fetchEvent, deleteTeam as apiDeleteTeam } from "@/lib/api";
import type { EventData } from "@/types/eventio";

function ConfirmationModal({
  message,
  onConfirm,
  onCancel,
  showModal,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  showModal: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setIsVisible(showModal), 50);
  }, [showModal]);

  const cancel = () => {
    setIsVisible(false);
    setTimeout(() => onCancel(), 200);
  };
  const confirm = () => {
    setIsVisible(false);
    setTimeout(() => onConfirm(), 200);
  };

  if (!showModal) return null;

  return (
    <div
      className={`fixed inset-0 flex items-end sm:items-center justify-center bg-black/50 z-50 p-4 transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`bg-card border border-border rounded-2xl p-5 w-full max-w-sm shadow-xl transition-transform duration-200 ${isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-2"}`}
      >
        <p className="font-poppins text-foreground text-sm leading-relaxed mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-poppins text-sm font-medium"
            onClick={cancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 py-2.5 rounded-xl bg-primary text-white font-poppins text-sm font-medium"
            onClick={confirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamDetailsScreen() {
  const params = useParams();
  const id = params.id as string;
  const { userData } = useContext(UserDataContext);
  const [event, setEvent] = useState<EventData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const eventData = await fetchEvent(Number(id));
        if (eventData) setEvent(eventData);
      } catch {
        /* handled by interceptor */
      }
    }
    load();
  }, [id]);

  const deleteTeam = async () => {
    setShowModal(false);
    setDeleteLoading(true);
    try {
      const team = event?.Participant && (event.Participant as { team?: { id: number } }).team;
      if (team) await apiDeleteTeam(Number(id), team.id);
    } catch {
      /* ignore */
    } finally {
      setDeleteLoading(false);
      router.push(`/team-register/${id}`);
    }
  };

  const copyCode = async () => {
    if (!event || event.Participant === false || !event.Participant.team) return;
    try {
      await navigator.clipboard.writeText(event.Participant.team.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!event || !userData) return <TeamPageSkeleton variant="details" />;

  if (event.ma_ppt === 1) {
    router.push(`/event-details/${id}`);
    return null;
  }

  if (!event.Participant || !event.Participant.team) {
    router.push(`/team-register/${id}`);
    return null;
  }

  const team = event.Participant.team;
  const isLeader = userData.id === team.leader_id;
  const memberCount = team.Participant.length;
  const spotsLeft = Math.max(0, event.ma_ppt - memberCount);

  return (
    <div className="min-h-screen bg-background pb-32">
      <TeamEventHeader event={event} eventId={id} title="Your team" />

      <div className="px-5 pt-5 flex flex-col gap-5 max-w-lg mx-auto w-full">
        {/* Team name */}
        <div className="bg-card border border-border rounded-2xl p-5 text-center">
          <p className="text-mute text-[11px] font-poppins font-semibold uppercase tracking-wider mb-1">
            Team name
          </p>
          <h2 className="font-marcellus text-2xl text-foreground leading-tight">{team.name}</h2>
          <p className="text-mute text-sm font-poppins mt-2">
            {memberCount} of {event.ma_ppt} members
            {spotsLeft > 0 && (
              <span className="text-foreground/70"> · {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left</span>
            )}
          </p>
        </div>

        {/* Invite code */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-mute text-[11px] font-poppins font-semibold uppercase tracking-wider mb-2">
            Invite code
          </p>
          <button
            type="button"
            onClick={copyCode}
            className="w-full flex items-center justify-between gap-3 bg-surface border border-border rounded-xl px-4 py-3.5 active:scale-[0.99] transition-transform"
          >
            <span className="font-mono text-lg font-semibold tracking-[0.2em] text-foreground">
              {team.invite_code}
            </span>
            <span className="flex items-center gap-1.5 text-primary shrink-0">
              <Copy size={18} color="currentColor" />
              <span className="text-xs font-poppins font-medium">{copied ? "Copied!" : "Copy"}</span>
            </span>
          </button>
          <p className="text-mute text-xs font-poppins mt-2 leading-relaxed">
            Teammates enter this code on the join screen to register with your team.
          </p>
        </div>

        {/* Members */}
        <div>
          <p className="text-mute text-[11px] font-poppins font-semibold uppercase tracking-wider mb-3">
            Members ({memberCount})
          </p>
          <div className="flex flex-col gap-2">
            {team.Participant.map((u) => {
              const leader = u.user.id === team.leader_id;
              return (
                <div
                  key={u.user.id}
                  className="flex items-center gap-3 bg-card border border-border rounded-xl p-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.user.photo_url}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-poppins font-medium text-foreground truncate">{u.user.name}</p>
                    {leader && (
                      <p className="text-primary text-xs font-poppins mt-0.5 flex items-center gap-1">
                        <TickCircle size={12} color="currentColor" variant="Bold" />
                        Team leader
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isLeader && (
        <div className="fixed bottom-0 inset-x-0 p-4 pb-6 bg-background/95 backdrop-blur-sm border-t border-border">
          <button
            type="button"
            className="w-full max-w-lg mx-auto flex justify-center items-center gap-2 h-12 border border-red-500/40 text-red-500 rounded-2xl font-poppins text-sm font-semibold active:bg-red-500/10 disabled:opacity-50"
            disabled={deleteLoading}
            onClick={() => setShowModal(true)}
          >
            <Trash size={18} color="currentColor" />
            {deleteLoading ? "Deleting…" : "Delete team"}
            {deleteLoading && <Spinner />}
          </button>
        </div>
      )}

      {showModal && (
        <ConfirmationModal
          message="Delete this team? All members will need to create or join a team again."
          onConfirm={deleteTeam}
          onCancel={() => setShowModal(false)}
          showModal={showModal}
        />
      )}
    </div>
  );
}
