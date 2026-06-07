import Link from "next/link";
import { ArrowLeft } from "iconsax-react";
import type { EventData } from "@/types/eventio";

interface Props {
  event: EventData;
  eventId: string;
  title: string;
}

export default function TeamEventHeader({ event, eventId, title }: Props) {
  const teamSizeLabel =
    event.ma_ppt === event.min_ppt
      ? `${event.ma_ppt} per team`
      : `${event.min_ppt}–${event.ma_ppt} members`;

  return (
    <>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <Link
          href={`/event-details/${eventId}`}
          className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-card border border-border text-foreground"
          aria-label="Back to event"
        >
          <ArrowLeft size={18} color="currentColor" />
        </Link>
        <h1 className="font-poppins font-semibold text-foreground text-base truncate">{title}</h1>
      </div>

      <div className="px-5 pt-5">
        <div className="flex gap-3 items-center bg-card border border-border rounded-2xl p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.event_page_image_url}
            alt=""
            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border"
          />
          <div className="min-w-0 flex-1">
            <p className="font-poppins font-semibold text-foreground leading-snug truncate">{event.name}</p>
            <p className="text-mute text-xs font-poppins mt-0.5">Team event · {teamSizeLabel}</p>
          </div>
        </div>
      </div>
    </>
  );
}
