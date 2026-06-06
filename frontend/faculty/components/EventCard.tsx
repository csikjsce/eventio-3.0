"use client";

import Link from "next/link";
import { ChevronRight, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { EventData } from "@/lib/types";
import { STATE_BADGE, fmtDate } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function EventCard({
  event,
  showCouncil = true,
  highlight = false,
}: {
  event:       EventData;
  showCouncil?: boolean;
  highlight?:  boolean;
}) {
  const badge = STATE_BADGE[event.state] ?? { label: event.state, cls: "bg-muted text-muted-foreground" };

  return (
    <Link
      href={`/event/${event.id}`}
      className={cn(
        "block bg-card border rounded-2xl p-4 sm:p-5 hover:border-sky-500/30 transition-all group",
        highlight ? "border-sky-500/40 ring-1 ring-sky-500/10" : "border-border",
      )}
    >
      <div className="flex gap-4">
        {event.banner_url ? (
          <img src={event.banner_url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-muted shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {event.name}
              </p>
              {showCouncil && (
                <p className="text-muted-foreground text-xs mt-0.5 truncate">
                  {event.organizer?.name}
                </p>
              )}
            </div>
            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0", badge.cls)}>
              {badge.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={11} /> {fmtDate(event.dates[0])}
            </span>
            {event.venue && <span className="truncate">{event.venue}</span>}
          </div>
        </div>
        <ChevronRight size={16} className="text-muted-foreground shrink-0 mt-1 group-hover:text-sky-500 transition-colors" />
      </div>
    </Link>
  );
}

export function ApprovalTimeline({ chain }: { chain: EventData["approval_chain"] }) {
  if (!chain.length) {
    return (
      <p className="text-muted-foreground text-sm text-center py-6">
        No state history recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {chain.map((step, i) => {
        const isLast = i === chain.length - 1;
        const iconBg =
          step.status === "done"   ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          : step.status === "active" ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
          : step.status === "rejected" ? "bg-destructive/10 border-destructive/30 text-destructive"
          : "bg-muted border-border text-muted-foreground";

        return (
          <div key={`${step.stage}-${i}`} className="flex gap-4">
            <div className="flex flex-col items-center shrink-0">
              <span className="text-[10px] text-muted-foreground mb-1">{i + 1}</span>
              <div className={cn("w-9 h-9 rounded-full border-2 flex items-center justify-center", iconBg)}>
                {step.status === "rejected"
                  ? <XCircle size={14} />
                  : step.status === "done"
                    ? <CheckCircle2 size={14} />
                    : <Clock size={14} />}
              </div>
              {!isLast && (
                <div className="flex flex-col items-center my-1 min-h-[1.5rem]">
                  <div className="w-px flex-1 bg-border" />
                  <ChevronRight size={10} className="text-muted-foreground rotate-90 my-0.5" />
                  <div className="w-px flex-1 bg-border" />
                </div>
              )}
            </div>
            <div className={cn("flex-1 min-w-0", isLast ? "pb-0" : "pb-4")}>
              <p className="text-sm font-semibold">{step.label}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{step.actor}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
