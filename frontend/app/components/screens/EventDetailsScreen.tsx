"use client";

import {
  ArrowLeft,
  Calendar2,
  CalendarAdd,
  Location,
  Send2,
  User,
  TickCircle,
  Profile2User,
} from "iconsax-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import IconText from "@/components/IconText";
import Loader from "@/components/Loader";
import Passage from "@/components/Passage";
import Spinner from "@/components/Spinner";
import FeedbackModal from "@/components/FeedbackModal";
import { fetchEvent, registerForEvent, claimTicket as apiClaimTicket, rateEvent } from "@/lib/api";
import { EventDetailsSkeleton } from "@/components/Skeletons";
import type { EventData } from "@/types/eventio";

export default function EventDetailsScreen() {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isFeedbackPopupOpen, setIsFeedbackPopupOpen] = useState(false);

  const [buttonState, setButtonState] = useState<{
    text: string;
    loading: boolean;
    disabled: boolean;
    onClick: () => void;
  }>({
    text: "Loading...",
    loading: true,
    disabled: true,
    onClick: () => {},
  });

  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const register = useCallback(async () => {
    setButtonState({ text: "Registering", loading: true, disabled: true, onClick: () => {} });
    try {
      await registerForEvent(Number(id));
      setButtonState({ text: "Registered ✓", loading: false, disabled: true, onClick: () => {} });
      setSnackbarVisible(true);
      setTimeout(() => setSnackbarVisible(false), 3000);
    } catch {
      setButtonState({ text: "Register Now", loading: false, disabled: false, onClick: register });
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const claimTicket = useCallback(async () => {
    setButtonState({ text: "RSVPing…", loading: true, disabled: true, onClick: () => {} });
    try {
      await apiClaimTicket(Number(id));
      setButtonState({
        text: "View Ticket",
        loading: false,
        disabled: false,
        onClick: () => router.push("/ticket/" + id),
      });
      setSnackbarVisible(true);
      setTimeout(() => setSnackbarVisible(false), 3000);
    } catch {
      setButtonState({ text: "RSVP for this event", loading: false, disabled: false, onClick: claimTicket });
    }
  }, [id, router]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const eventData: EventData | null = await fetchEvent(Number(id));
        if (!eventData || cancelled) { setLoading(false); return; }
        setEvent(eventData);
        setLoading(false);


        // Derive button state from event
        const s = eventData.state;
        if (s === "REGISTRATION_OPEN") {
          if (eventData.ma_ppt > 1) {
            setButtonState({
              text: eventData.Participant ? "View Team" : "Register",
              loading: false, disabled: false,
              onClick: () => eventData.Participant
                ? router.push("/team-details/" + id)
                : router.push("/team-register/" + id),
            });
          } else if (eventData.Participant) {
            setButtonState({ text: "Registered ✓", loading: false, disabled: true, onClick: () => {} });
          } else {
            setButtonState({ text: "Register Now", loading: false, disabled: false, onClick: register });
          }
        } else if (s === "REGISTRATION_CLOSED") {
          setButtonState({
            text: eventData.Participant ? "Already registered" : "Registration Closed",
            loading: false, disabled: true, onClick: () => {},
          });
        } else if (s === "TICKET_OPEN" && eventData.is_ticket_feature_enabled) {
          if (eventData.Participant) {
            if (eventData.Participant.ticket_collected) {
              setButtonState({ text: "View Ticket", loading: false, disabled: false, onClick: () => router.push("/ticket/" + eventData.id) });
            } else if ((eventData.tickets_sold ?? 0) >= (eventData.ticket_count ?? Infinity)) {
              setButtonState({ text: "Tickets Sold Out", loading: false, disabled: true, onClick: () => {} });
            } else {
              setButtonState({ text: "RSVP for this event", loading: false, disabled: false, onClick: claimTicket });
            }
          } else {
            setButtonState({ text: "Not registered", loading: false, disabled: true, onClick: () => {} });
          }
        } else if (s === "TICKET_CLOSED" || !eventData.is_ticket_feature_enabled) {
          if (eventData.Participant && eventData.Participant.ticket_collected) {
            setButtonState({ text: "View Ticket", loading: false, disabled: false, onClick: () => router.push("/ticket/" + eventData.id) });
          } else {
            setButtonState({ text: "RSVP closed", loading: false, disabled: true, onClick: () => {} });
          }
        } else if (s === "UPCOMING") {
          setButtonState({ text: "Opening Soon", loading: false, disabled: true, onClick: () => {} });
        } else if (s === "ONGOING") {
          if (eventData.registration_type === "EXTERNAL") {
            setButtonState({ text: "Register Externally", loading: false, disabled: false, onClick: () => { window.location.href = eventData.external_registration_link ?? "#"; } });
          } else if (eventData.start_in_event_activity) {
            setButtonState({ text: "Follow Activity", loading: false, disabled: false, onClick: () => { window.location.href = eventData.in_event_activity ?? "#"; } });
          } else {
            setButtonState({ text: "Event is Ongoing", loading: false, disabled: true, onClick: () => {} });
          }
        } else if (s === "COMPLETED") {
          setButtonState({ text: "Give Feedback", loading: false, disabled: false, onClick: () => setIsFeedbackPopupOpen(true) });
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, router, register, claimTicket]);

  if (loading) return <EventDetailsSkeleton />;
  if (!event) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-mute font-poppins">Event not found</p>
    </div>
  );

  return (
    <>
      <div className="bg-background min-h-screen">
        {/* Hero image */}
        <div className="relative w-full aspect-square">
          <img
            src={event.event_page_image_url}
            alt={event.name}
            className="w-full aspect-square object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12">
            <Link
              href="/"
              className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <ArrowLeft size={20} color="white" />
            </Link>
            <div className="flex-1" />
            <div className="flex gap-2">
              <button
                className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
                onClick={() => {
                  const date = (event.dates[0] && new Date(event.dates[0])) || new Date();
                  const y = date.getFullYear(), m = String(date.getMonth()+1).padStart(2,"0"), d = String(date.getDate()).padStart(2,"0");
                  const h = String(date.getHours()).padStart(2,"0"), min = String(date.getMinutes()).padStart(2,"0"), s = String(date.getSeconds()).padStart(2,"0");
                  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&details=${encodeURIComponent(event.description)}&dates=${y}${m}${d}T${h}${min}${s}&ctz=Asia%2FKolkata`;
                  window.open(url, "_blank");
                }}
              >
                <CalendarAdd size={18} color="white" />
              </button>
              <button
                className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
                onClick={() => navigator.share?.({ title: event.name, url: window.location.href, text: event.description })}
              >
                <Send2 size={18} color="white" />
              </button>
            </div>
          </div>

          {/* Date badge */}
          {event.dates[0] && (
            <div className="absolute bottom-4 left-4 bg-foreground text-background rounded-full px-4 py-1.5">
              <span className="text-xs font-poppins font-semibold">
                {new Date(event.dates[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-5 pt-6 pb-32 flex flex-col gap-6">
          {/* Title + organizer */}
          <div>
            <h1 className="font-poppins font-bold text-2xl text-foreground leading-tight">
              {event.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <img
                src={event.organizer.photo_url}
                alt={event.organizer.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-mute text-sm font-poppins">
                By {event.organizer.name}
              </span>
            </div>
          </div>

          {/* Info row */}
          <div className="bg-card rounded-2xl p-4 flex justify-between border border-border">
            <IconText
              Icon={Calendar2}
              line1={event.dates[0] ? new Date(event.dates[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBA"}
              line2={
                event.dates[0]
                  ? event.dates.length > 1
                    ? `${new Date(event.dates[0]).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} – ${new Date(event.dates[event.dates.length - 1]).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
                    : new Date(event.dates[0]).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                  : "—"
              }
            />
            <div className="w-px bg-border" />
            <IconText
              Icon={Location}
              line1={event.venue ? event.venue.split(" ")[0] : "TBA"}
              line2={event.venue && event.venue.split(" ").length > 1 ? event.venue.slice(event.venue.indexOf(" ")) : ""}
            />
            <div className="w-px bg-border" />
            {event.ma_ppt > 1 ? (
              <IconText Icon={Profile2User} line1="TEAM" line2={event.ma_ppt === event.min_ppt ? `${event.ma_ppt}` : `${event.min_ppt}–${event.ma_ppt}`} />
            ) : (
              <IconText Icon={User} line1={event.ticket_count ? String(event.ticket_count) : "—"} line2="Seats" />
            )}
          </div>

          {/* About */}
          <Passage title="About the Event" content={event.long_description || event.description} />

          {/* Fee */}
          <div className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
            <span className="text-mute text-sm font-poppins">Entry Fee</span>
            <span className={`font-poppins font-bold text-base ${event.fee === 0 ? "text-green-500" : "text-foreground"}`}>
              {event.fee === 0 ? "Free" : `₹${event.fee}`}
            </span>
          </div>

          {/* In-event activity */}
          {event.start_in_event_activity && event.in_event_activity && (
            <Passage
              title="Event Activity"
              content={<a href={event.in_event_activity} className="text-primary underline">{event.in_event_activity}</a>}
            />
          )}
        </div>

        {/* Fixed CTA */}
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-gradient-to-t from-background via-background to-transparent">
          <button
            className="w-full rounded-full bg-primary text-white flex items-center justify-center gap-2 h-14 text-base font-semibold font-poppins shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none transition-all"
            disabled={buttonState.disabled}
            onClick={buttonState.onClick}
          >
            {buttonState.loading && <Spinner />}
            {buttonState.text}
          </button>
        </div>
      </div>

      {/* Feedback modal */}
      {isFeedbackPopupOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-6"
          onClick={(e) => { if (e.target === e.currentTarget) setIsFeedbackPopupOpen(false); }}
        >
          <FeedbackModal event_id={event.id} setIsFeedbackPopupOpen={setIsFeedbackPopupOpen} />
        </div>
      )}

      {/* Snackbar */}
      {snackbarVisible && (
        <div className="fixed bottom-24 left-4 right-4 bg-green-500 text-white p-4 rounded-2xl z-40 flex gap-3 items-center shadow-lg">
          <TickCircle size="22" color="white" variant="Bold" />
          <span className="font-poppins text-sm font-medium">Action successful!</span>
        </div>
      )}
    </>
  );
}
