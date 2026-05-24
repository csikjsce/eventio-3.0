"use client";
import Link from "next/link";
import { useState } from "react";
import { MOCK_EVENTS, COUNCIL_USER, PIPELINE_STAGES, type EventData } from "@/lib/dummy-data";
import { Plus, TrendingUp, Activity, CheckCircle, Clock, ChevronRight } from "lucide-react";

const PIPELINE_COLOR: Record<string, string> = {
  DRAFT:               "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  PROPOSAL_SUBMITTED:  "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  PROPOSAL_APPROVED:   "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  BOOKING_PENDING:     "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  DIRECTOR_VP_PENDING: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  FULLY_APPROVED:      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  REGISTRATION_OPEN:   "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  REGISTRATION_CLOSED: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  ONGOING:             "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
  COMPLETED:           "bg-zinc-100 text-zinc-500 dark:bg-zinc-700/50 dark:text-zinc-400",
  REPORT_SUBMITTED:    "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
  REJECTED:            "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

function getPipelineLabel(stage: string) {
  return PIPELINE_STAGES.find(s => s.id === stage)?.label ?? stage.replace(/_/g, " ");
}

function MiniPipeline({ event }: { event: EventData }) {
  const stageIdx = PIPELINE_STAGES.findIndex(s => s.id === event.pipeline_stage);
  const total = PIPELINE_STAGES.length;
  const pct = Math.round((stageIdx / (total - 1)) * 100);
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-subtle-tx text-[10px] font-fira">Journey progress</span>
        <span className="text-muted-tx text-[10px] font-fira">{pct}%</span>
      </div>
      <div className="h-1 bg-surface2 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${stageIdx < 0 ? "bg-zinc-400" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function EventCard({ event }: { event: EventData }) {
  const date = event.dates[0]
    ? new Date(event.dates[0]).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <Link href={`/event-details/${event.id}`}
      className="group bg-surface border border-border-c hover:border-red-500/30 rounded-2xl overflow-hidden transition-all hover:shadow-md flex flex-col">
      {/* Banner */}
      <div className="relative h-32 overflow-hidden shrink-0">
        <img src={event.banner_url} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className={`absolute top-2 right-2 text-[10px] font-fira font-medium px-2 py-0.5 rounded-md ${PIPELINE_COLOR[event.pipeline_stage] ?? "bg-surface2 text-subtle-tx"}`}>
          {getPipelineLabel(event.pipeline_stage)}
        </span>
        <span className="absolute top-2 left-2 text-[10px] font-fira uppercase tracking-widest px-2 py-0.5 rounded-md bg-black/50 text-white">
          {event.event_type.replace(/_/g, " ")}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-tx text-sm font-fira font-semibold leading-snug mb-1 group-hover:text-red-500 transition-colors">{event.name}</h3>
        <p className="text-subtle-tx text-xs font-fira mb-1">{date} · {event.venue ?? "Online"}</p>
        <p className="text-muted-tx text-xs font-fira line-clamp-2 flex-1">{event.description}</p>
        <MiniPipeline event={event} />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-c">
          <div className="flex gap-3">
            <Link href={`/new-event/${event.id}`} onClick={e => e.stopPropagation()}
              className="text-xs font-fira text-subtle-tx hover:text-tx transition-colors">Edit</Link>
            <Link href={`/participants?event=${event.id}`} onClick={e => e.stopPropagation()}
              className="text-xs font-fira text-subtle-tx hover:text-tx transition-colors">Participants</Link>
          </div>
          <span className="text-xs font-fira text-red-500 flex items-center gap-0.5 group-hover:gap-1 transition-all">
            View <ChevronRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [view, setView] = useState<"grid" | "list">("grid");

  const stats = [
    { label: "Total Events",      value: MOCK_EVENTS.length,                                               icon: <Activity    size={15} />, color: "text-tx"          },
    { label: "Awaiting Approval", value: MOCK_EVENTS.filter(e => ["PROPOSAL_SUBMITTED","DIRECTOR_VP_PENDING"].includes(e.pipeline_stage)).length, icon: <Clock size={15} />, color: "text-amber-500" },
    { label: "Registration Open", value: MOCK_EVENTS.filter(e => e.pipeline_stage === "REGISTRATION_OPEN").length, icon: <TrendingUp size={15} />, color: "text-emerald-500" },
    { label: "Completed",         value: MOCK_EVENTS.filter(e => ["COMPLETED","REPORT_SUBMITTED"].includes(e.pipeline_stage)).length, icon: <CheckCircle size={15} />, color: "text-muted-tx" },
  ];

  const sorted = [...MOCK_EVENTS].sort((a, b) => new Date(b.dates[0]).getTime() - new Date(a.dates[0]).getTime());
  const needsAction = MOCK_EVENTS.filter(e => !["PROPOSAL_SUBMITTED","DIRECTOR_VP_PENDING","REPORT_SUBMITTED"].includes(e.pipeline_stage) && e.pipeline_stage !== "REJECTED");

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <img src={COUNCIL_USER.photo_url} alt={COUNCIL_USER.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-red-400/30 object-cover" />
          <div>
            <p className="text-subtle-tx text-xs font-fira">Welcome back</p>
            <h1 className="text-tx text-lg sm:text-xl font-marcellus">{COUNCIL_USER.name}</h1>
          </div>
        </div>
        <Link href="/new-event"
          className="flex items-center gap-1.5 px-3 py-2 sm:px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-fira font-semibold rounded-lg transition-colors">
          <Plus size={15} /> <span className="hidden sm:inline">New Event</span><span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-surface border border-border-c rounded-xl p-4 sm:p-5 transition-colors">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className="text-subtle-tx text-[10px] sm:text-xs font-fira">{s.label}</p>
              <span className="text-subtle-tx">{s.icon}</span>
            </div>
            <p className={`text-2xl sm:text-3xl font-bold font-fira ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Needs attention */}
      {needsAction.length > 0 && (
        <div className="mb-6 sm:mb-8 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-amber-500" />
            <p className="text-amber-600 dark:text-amber-400 text-sm font-fira font-semibold">Action needed ({needsAction.length})</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {needsAction.map(e => (
              <Link key={e.id} href={`/event-details/${e.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-500/10 hover:bg-amber-200 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-fira rounded-lg transition-colors">
                {e.name} <ChevronRight size={11} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Events grid */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-tx text-lg sm:text-xl font-marcellus">Your Events</h2>
        <div className="flex gap-0.5 bg-surface border border-border-c rounded-lg p-1">
          {(["grid", "list"] as const).map(v => (
            <button key={v} type="button" onClick={() => setView(v)}
              className={`px-3 py-1 rounded-md text-xs font-fira transition-all capitalize ${view === v ? "bg-red-500 text-white" : "text-subtle-tx hover:text-tx"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map(event => <EventCard key={event.id} event={event} />)}
        </div>
      ) : (
        <div className="bg-surface border border-border-c rounded-2xl overflow-hidden">
          {sorted.map((event, i) => {
            const date = event.dates[0]
              ? new Date(event.dates[0]).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : "—";
            return (
              <Link key={event.id} href={`/event-details/${event.id}`}
                className={`group flex items-center gap-3 px-4 py-3.5 sm:px-6 hover:bg-surface2 transition-colors ${i > 0 ? "border-t border-border-c" : ""}`}>
                <img src={event.banner_url} alt={event.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-tx text-sm font-fira font-semibold truncate group-hover:text-red-500 transition-colors">{event.name}</p>
                  <p className="text-subtle-tx text-xs font-fira">{date} · {event.venue ?? "Online"}</p>
                </div>
                <span className={`hidden sm:inline text-[10px] font-fira px-2 py-0.5 rounded-md shrink-0 ${PIPELINE_COLOR[event.pipeline_stage] ?? "bg-surface2 text-subtle-tx"}`}>
                  {getPipelineLabel(event.pipeline_stage)}
                </span>
                <ChevronRight size={14} className="text-subtle-tx shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
