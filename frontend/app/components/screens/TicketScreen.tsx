"use client";

import { ArrowLeft } from "iconsax-react";
import { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserDataContext } from "@/contexts/userContext";
import { fetchEvent } from "@/lib/api";
import QRCode from "react-qr-code";
import type { EventData } from "@/types/eventio";

export default function TicketScreen() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { userData } = useContext(UserDataContext);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [participantId, setParticipantId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchEvent(Number(id))
      .then((event: EventData) => {
        setEventData(event);
        if (event.Participant !== false && event.Participant?.id) {
          setParticipantId(String(event.Participant.id));
        }
      })
      .catch(() => setError("Could not load your ticket. Please go back and try again."))
      .finally(() => setLoading(false));
  }, [id]);

  // QR encodes a JSON payload so the council scanner can extract both IDs
  const qrValue = participantId
    ? JSON.stringify({ event_id: Number(id), participant_id: Number(participantId) })
    : "";

  const dateLabel = eventData?.dates[0]
    ? new Date(eventData.dates[0]).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "TBA";

  const timeLabel = eventData?.dates[0]
    ? new Date(eventData.dates[0]).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const hasEndTime = !!(eventData?.dates && eventData.dates.length > 1);
  const endTimeLabel = hasEndTime
    ? new Date(eventData!.dates[eventData!.dates.length - 1]).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
  const endDateLabel = hasEndTime
    ? new Date(eventData!.dates[eventData!.dates.length - 1]).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : dateLabel;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm bg-card rounded-3xl overflow-hidden border border-border shadow-2xl animate-pulse">
          <div className="h-48 bg-surface" />
          <div className="px-6 py-6 space-y-4">
            <div className="h-6 bg-surface rounded-lg w-3/4" />
            <div className="h-4 bg-surface rounded w-1/2" />
            <div className="h-24 bg-surface rounded-2xl" />
            <div className="h-40 bg-surface rounded-2xl mx-auto w-40" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 gap-4">
        <p className="text-foreground font-poppins text-center">{error || "Ticket not found."}</p>
        <button
          onClick={() => router.back()}
          className="text-primary font-poppins text-sm underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      {/* Back button */}
      <div className="w-full max-w-sm mb-6 flex items-center">
        <button
          onClick={() => router.push("/event-details/" + id)}
          className="flex items-center gap-2 text-mute"
        >
          <ArrowLeft size={20} color="#8a8a8a" />
          <span className="font-poppins text-sm text-mute">Back</span>
        </button>
      </div>

      {/* Ticket card */}
      <div className="w-full max-w-sm bg-card rounded-3xl overflow-hidden border border-border shadow-2xl">
        {/* Event image */}
        <div className="relative">
          {eventData.event_page_image_url ? (
            <img
              src={eventData.event_page_image_url}
              alt={eventData.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-surface flex items-center justify-center">
              <span className="text-mute text-sm font-poppins">{eventData.name}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        </div>

        {/* Ticket body */}
        <div className="px-6 pt-2 pb-6">
          <h2 className="font-poppins font-bold text-xl text-foreground leading-tight">
            {eventData.name} Ticket
          </h2>
          <p className="text-mute text-xs font-poppins mt-1">
            By {eventData.organizer?.name}
          </p>

          {/* Time info */}
          <div className="mt-4 bg-surface rounded-2xl p-4 border border-border">
            <p className="text-mute text-xs font-poppins mb-3 text-center">
              {hasEndTime ? "Event timing" : "Ticket will be active from"}
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-mute font-poppins uppercase tracking-wider mb-0.5">Start</p>
                <p className="text-foreground font-bold text-xl font-poppins">{timeLabel}</p>
                <p className="text-mute text-xs font-poppins mt-0.5">{dateLabel}</p>
              </div>
              <div className="h-px flex-1 border-t-2 border-dashed border-border mx-4" />
              <div className="text-right">
                <p className="text-[10px] text-mute font-poppins uppercase tracking-wider mb-0.5">End</p>
                <p className={`font-bold text-xl font-poppins ${hasEndTime ? "text-foreground" : "text-mute"}`}>
                  {endTimeLabel}
                </p>
                <p className="text-mute text-xs font-poppins mt-0.5">{endDateLabel}</p>
              </div>
            </div>
          </div>

          {/* Holder info */}
          <div className="mt-4 flex gap-6">
            <div>
              <p className="text-mute text-xs font-poppins">Name</p>
              <p className="text-foreground font-semibold text-sm font-poppins mt-0.5">
                {userData?.name || "—"}
              </p>
            </div>
            <div>
              <p className="text-mute text-xs font-poppins">College</p>
              <p className="text-foreground font-semibold text-sm font-poppins mt-0.5">
                {userData?.college || "—"}
              </p>
            </div>
            {eventData.Participant !== false && eventData.Participant?.team && (
              <div>
                <p className="text-mute text-xs font-poppins">Team</p>
                <p className="text-foreground font-semibold text-sm font-poppins mt-0.5">
                  {eventData.Participant.team.name}
                </p>
              </div>
            )}
          </div>

          {/* Divider with notches */}
          <div className="relative my-6 flex items-center">
            <div className="absolute -left-10 w-6 h-6 bg-background rounded-full border-r border-border" />
            <div className="flex-1 border-t-2 border-dashed border-border" />
            <div className="absolute -right-10 w-6 h-6 bg-background rounded-full border-l border-border" />
          </div>

          {/* QR code */}
          <div className="flex flex-col items-center gap-3">
            {qrValue ? (
              <>
                <div className="bg-white p-3 rounded-2xl">
                  <QRCode
                    value={qrValue}
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#111111"
                  />
                </div>
                <p className="text-mute text-xs font-poppins tracking-wider">
                  ID: {participantId}
                </p>
              </>
            ) : (
              <div className="bg-surface rounded-2xl p-6 flex flex-col items-center gap-2 border border-border">
                <p className="text-mute text-sm font-poppins text-center">
                  Ticket not yet claimed.
                </p>
                <button
                  onClick={() => router.push("/event-details/" + id)}
                  className="text-primary font-poppins text-xs underline mt-1"
                >
                  Claim your ticket →
                </button>
              </div>
            )}
            <p className="text-mute text-xs font-poppins">Show at Registration</p>
          </div>
        </div>
      </div>
    </div>
  );
}
