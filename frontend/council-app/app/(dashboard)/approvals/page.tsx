"use client";
import { useState } from "react";
import Link from "next/link";
import { getNextAction, PIPELINE_STAGES, type EventData } from "@/lib/dummy-data";
import { transitionEventState } from "@/lib/api";
import { useData } from "@/contexts/DataContext";
import {
  Inbox, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight,
  CalendarDays, MapPin, Send, Edit2,
} from "lucide-react";

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const STAGE_COLOR: Record<string, string> = {
  DRAFT:               "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  PROPOSAL_SUBMITTED:  "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  PROPOSAL_APPROVED:   "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  BOOKING_PENDING:     "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  DIRECTOR_VP_PENDING: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  FULLY_APPROVED:      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  REGISTRATION_OPEN:   "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  ONGOING:             "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
  COMPLETED:           "bg-zinc-100 text-zinc-500 dark:bg-zinc-700/50 dark:text-zinc-400",
  REPORT_SUBMITTED:    "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
  REJECTED:            "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
};

function getPipelineLabel(stage: string) {
  return PIPELINE_STAGES.find(s => s.id === stage)?.label ?? stage.replace(/_/g, " ");
}

// ─── Urgency grouping ─────────────────────────────────────────────────────────

const URGENT_STAGES   = ["DRAFT", "FULLY_APPROVED", "COMPLETED", "REJECTED"];
const WAITING_STAGES  = ["PROPOSAL_SUBMITTED", "DIRECTOR_VP_PENDING"];
const INPROGRESS_STAGES = ["PROPOSAL_APPROVED", "BOOKING_PENDING", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "ONGOING"];
const DONE_STAGES     = ["REPORT_SUBMITTED"];

function groupEvents(events: EventData[]) {
  return {
    urgent:     events.filter(e => URGENT_STAGES.includes(e.pipeline_stage)),
    waiting:    events.filter(e => WAITING_STAGES.includes(e.pipeline_stage)),
    inProgress: events.filter(e => INPROGRESS_STAGES.includes(e.pipeline_stage)),
    done:       events.filter(e => DONE_STAGES.includes(e.pipeline_stage)),
  };
}

// ─── Event Action Card ────────────────────────────────────────────────────────

function ApprovalCard({ event, onAction, loadingId }: {
  event: EventData;
  onAction: (e: EventData, cta: string) => void;
  loadingId: number | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const nextAction = getNextAction(event);
  const isThisLoading = loadingId === event.id;
  const date = event.dates[0]
    ? new Date(event.dates[0]).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const latestChain = event.approval_chain[event.approval_chain.length - 1];
  const isWaiting   = WAITING_STAGES.includes(event.pipeline_stage);
  const isUrgent    = URGENT_STAGES.includes(event.pipeline_stage) && event.pipeline_stage !== "REJECTED";
  const isRejected  = event.pipeline_stage === "REJECTED";

  return (
    <div className={`bg-surface border rounded-2xl overflow-hidden transition-all ${isRejected ? "border-red-500/40" : isUrgent ? "border-amber-400/40" : "border-border-c"}`}>
      {/* Header */}
      <button type="button" onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 sm:p-5 text-left hover:bg-surface2 transition-colors">
        <img src={event.banner_url} alt={event.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-tx text-sm font-fira font-semibold truncate">{event.name}</p>
            <span className={`text-[10px] font-fira px-1.5 py-0.5 rounded-md shrink-0 ${STAGE_COLOR[event.pipeline_stage] ?? "bg-surface2 text-subtle-tx"}`}>
              {getPipelineLabel(event.pipeline_stage)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-fira text-subtle-tx">
            <span className="flex items-center gap-1"><CalendarDays size={10} /> {date}</span>
            {event.venue && <span className="flex items-center gap-1 hidden sm:flex"><MapPin size={10} /> {event.venue}</span>}
          </div>
        </div>
        <div className={`flex items-center gap-1 shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}>
          <ChevronRight size={16} className="text-muted-tx" />
        </div>
      </button>

      {/* Next action strip */}
      {nextAction && !expanded && (
        <div className={`flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 border-t ${isWaiting ? "border-amber-200/50 dark:border-amber-500/10 bg-amber-50/50 dark:bg-amber-500/5" : isRejected ? "border-red-200/50 dark:border-red-500/10 bg-red-50/50 dark:bg-red-500/5" : "border-border-c bg-surface2/50"}`}>
          <p className="text-xs font-fira text-muted-tx flex-1 truncate">
            {isWaiting ? <Clock size={11} className="inline mr-1 text-amber-500" /> : <AlertCircle size={11} className="inline mr-1 text-red-400" />}
            {nextAction.label}
          </p>
          {nextAction.route ? (
            <Link href={nextAction.route}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-fira rounded-lg transition-colors">
              {nextAction.cta} <ChevronRight size={11} />
            </Link>
          ) : (
            <button type="button" onClick={() => onAction(event, nextAction.cta)} disabled={!!loadingId}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-fira rounded-lg transition-colors">
              {isThisLoading ? "…" : nextAction.cta} {!isThisLoading && <ChevronRight size={11} />}
            </button>
          )}
        </div>
      )}

      {/* Expanded: approval chain */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-5 border-t border-border-c pt-4">
          {/* Next action */}
          {nextAction && (
            <div className={`flex items-center justify-between gap-3 p-3 rounded-xl mb-4 ${isWaiting ? "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20" : isRejected ? "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20" : "bg-surface2 border border-border-c"}`}>
              <p className="text-xs font-fira text-muted-tx flex-1">{nextAction.label}</p>
              {nextAction.route ? (
                <Link href={nextAction.route}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-fira rounded-lg transition-colors">
                  {nextAction.cta}
                </Link>
              ) : (
                <button type="button" onClick={() => onAction(event, nextAction.cta)} disabled={!!loadingId}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-fira rounded-lg transition-colors">
                  {isThisLoading ? "Processing…" : nextAction.cta}
                </button>
              )}
            </div>
          )}

          {/* Approval timeline */}
          <p className="text-subtle-tx text-[11px] font-fira uppercase tracking-widest mb-3">Approval Timeline</p>
          {event.approval_chain.length === 0 ? (
            <p className="text-muted-tx text-xs font-fira italic">No actions yet — submit proposal to begin.</p>
          ) : (
            <div className="space-y-0">
              {event.approval_chain.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0 w-5">
                    <div className="mt-0.5">
                      {step.status === "done"    ? <CheckCircle2 size={14} className="text-emerald-500" />
                      : step.status === "active" ? <Clock        size={14} className="text-amber-500" />
                      : step.status === "rejected"? <XCircle     size={14} className="text-red-500" />
                      : <div className="w-3.5 h-3.5 rounded-full border-2 border-border-c" />}
                    </div>
                    {i < event.approval_chain.length - 1 && <div className="w-px flex-1 bg-border-c min-h-[1.5rem] mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-tx text-sm font-fira font-semibold leading-tight">{step.label}</p>
                    <p className="text-subtle-tx text-xs font-fira">{step.actor}</p>
                    {step.date && <p className="text-subtle-tx text-[11px] font-fira">{fmt(step.date)}</p>}
                    {step.note && (
                      <div className="mt-1.5 px-3 py-2 bg-surface2 border border-border-c rounded-lg">
                        <p className="text-muted-tx text-xs font-fira italic">&ldquo;{step.note}&rdquo;</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick links */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-border-c flex-wrap">
            <Link href={`/event-details/${event.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx text-xs font-fira rounded-lg transition-all">
              View Details
            </Link>
            <Link href={`/new-event/${event.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx text-xs font-fira rounded-lg transition-all">
              <Edit2 size={11} /> Edit Event
            </Link>
            <Link href={`/announcements`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx text-xs font-fira rounded-lg transition-all">
              <Send size={11} /> Announce
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, icon, events, onAction, loadingId, defaultOpen = true }: {
  title: string; icon: React.ReactNode; events: EventData[];
  onAction: (e: EventData, cta: string) => void;
  loadingId: number | null;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (events.length === 0) return null;
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-tx text-sm font-fira font-semibold">{title}</h2>
        <span className="text-subtle-tx text-xs font-fira">({events.length})</span>
        <ChevronRight size={14} className={`text-muted-tx ml-auto transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="space-y-3">
          {events.map(e => <ApprovalCard key={e.id} event={e} onAction={onAction} loadingId={loadingId} />)}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STATE_TRANSITIONS: Record<string, string> = {
  "Submit Proposal":   "APPLIED_FOR_APPROVAL",
  "Open Registration": "REGISTRATION_OPEN",
};

export default function ApprovalsPage() {
  const { events, loading, refreshEvents } = useData();
  const [toast, setToast]       = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);

  function showToast(msg: string) {
    setToast(msg); setTimeout(() => setToast(""), 3500);
  }

  async function handleAction(event: EventData, cta: string) {
    const newState = STATE_TRANSITIONS[cta];
    if (newState) {
      if (loadingId !== null) return;
      setLoadingId(event.id);
      try {
        await transitionEventState(event.id, newState);
        await refreshEvents();
        const successMsg: Record<string, string> = {
          "Submit Proposal":   `Proposal for "${event.name}" submitted to faculty advisor!`,
          "Open Registration": `Registration for "${event.name}" is now open!`,
        };
        showToast(successMsg[cta]);
      } catch {
        showToast(`Failed to perform "${cta}" — please try again.`);
      } finally {
        setLoadingId(null);
      }
    } else {
      const infoMsg: Record<string, string> = {
        "Upload Documents": `Go to Event Details → Documents to upload files for "${event.name}".`,
        "Submit Report":    `Go to Event Details → Documents to upload the post-event report.`,
      };
      showToast(infoMsg[cta] ?? `${cta} triggered for "${event.name}"`);
    }
  }

  const groups = groupEvents(events);
  const totalPending = groups.urgent.length + groups.waiting.length + groups.inProgress.length;

  if (loading) return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 animate-pulse space-y-4">
      <div className="h-8 bg-surface rounded-xl w-48" />
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-surface rounded-2xl" />)}
    </div>
  );

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-surface border border-border-c shadow-xl rounded-xl px-4 py-3 text-tx text-sm font-fira flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-500" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Inbox size={20} className="text-tx" />
          <h1 className="text-tx font-marcellus text-xl sm:text-2xl">Action Inbox</h1>
          {totalPending > 0 && (
            <span className="bg-red-500 text-white text-xs font-fira px-2 py-0.5 rounded-full">{totalPending}</span>
          )}
        </div>
        <p className="text-muted-tx text-sm font-fira">Track where each event is in the approval journey and act on pending items.</p>
      </div>

      <div className="space-y-8">
        <Section title="Needs Your Action" icon={<AlertCircle size={15} className="text-red-500" />}
          events={groups.urgent} onAction={handleAction} loadingId={loadingId} defaultOpen={true} />
        <Section title="Waiting for Response" icon={<Clock size={15} className="text-amber-500" />}
          events={groups.waiting} onAction={handleAction} loadingId={loadingId} defaultOpen={true} />
        <Section title="In Progress" icon={<ChevronRight size={15} className="text-sky-500" />}
          events={groups.inProgress} onAction={handleAction} loadingId={loadingId} defaultOpen={true} />
        <Section title="Completed" icon={<CheckCircle2 size={15} className="text-emerald-500" />}
          events={groups.done} onAction={handleAction} loadingId={loadingId} defaultOpen={false} />
      </div>

      {events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Inbox size={40} className="text-subtle-tx mb-4" />
          <p className="text-muted-tx font-fira text-sm">No events yet.</p>
          <Link href="/new-event" className="text-red-500 text-sm font-fira hover:underline mt-2">Create your first event →</Link>
        </div>
      )}
    </div>
  );
}
