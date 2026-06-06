"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RegistrationFieldsEditor from "@/components/RegistrationFieldsEditor";
import type { RegistrationField } from "@/lib/registration-fields";
import { normalizeRegistrationFields } from "@/lib/registration-fields";
import {
  transitionEventState,
  updateEventSettings,
  fetchEventStats,
  bulkIssueTickets,
  bulkMarkPaid,
  downloadParticipantsCsv,
  fetchEvent,
  type EventControlStats,
} from "@/lib/api";
import {
  ArrowLeft, Settings, Zap, Users, Ticket, CreditCard,
  BarChart2, Send, ClipboardList, Download, RefreshCcw,
  Eye, EyeOff, Play, Pause, Square, CheckCircle2, AlertCircle, Lock,
  ChevronRight, Edit2,
} from "lucide-react";
import type { EventData } from "@/lib/dummy-data";

// ─── State machine ────────────────────────────────────────────────────────────

interface StateAction {
  label: string;
  newState: string;
  variant: "primary" | "secondary" | "danger" | "warning" | "purple";
  icon: React.ReactNode;
  confirm?: string;
}

const STATE_ACTIONS: Record<string, StateAction[]> = {
  UNLISTED: [
    { label: "Publish Event",    newState: "UPCOMING",           variant: "primary",   icon: <Eye size={14}/>,   confirm: "This makes the event publicly visible to all students." },
    { label: "Set Private",      newState: "PRIVATE",            variant: "secondary",  icon: <Lock size={14}/> },
  ],
  UPCOMING: [
    { label: "Open Registration",newState: "REGISTRATION_OPEN", variant: "primary",   icon: <Play size={14}/> },
    { label: "Unpublish",        newState: "UNLISTED",           variant: "secondary",  icon: <EyeOff size={14}/>, confirm: "This will hide the event from students." },
    { label: "Set Private",      newState: "PRIVATE",            variant: "danger",    icon: <Lock size={14}/>,   confirm: "This will hide the event completely." },
  ],
  REGISTRATION_OPEN: [
    { label: "Pause Registration",newState: "REGISTRATION_CLOSED",variant: "warning",  icon: <Pause size={14}/> },
    { label: "Make Tickets Live", newState: "TICKET_OPEN",       variant: "purple",    icon: <Ticket size={14}/>, confirm: "This closes registration and immediately opens ticket claiming." },
  ],
  REGISTRATION_CLOSED: [
    { label: "Resume Registration",newState: "REGISTRATION_OPEN",variant: "primary",  icon: <Play size={14}/> },
    { label: "Make Tickets Live", newState: "TICKET_OPEN",       variant: "purple",   icon: <Ticket size={14}/> },
    { label: "Start Event",       newState: "ONGOING",           variant: "danger",   icon: <Zap size={14}/>,    confirm: "Mark the event as live/ongoing?" },
  ],
  TICKET_OPEN: [
    { label: "Stop Ticket Sales",       newState: "TICKET_CLOSED",       variant: "warning",   icon: <Pause size={14}/>,  confirm: "This stops students from claiming new tickets." },
    { label: "Restart Registration",    newState: "REGISTRATION_OPEN",   variant: "secondary", icon: <RefreshCcw size={14}/>, confirm: "This reopens registration and closes ticket claiming." },
    { label: "Start Event",             newState: "ONGOING",             variant: "danger",    icon: <Zap size={14}/>,    confirm: "Mark the event as live/ongoing?" },
  ],
  TICKET_CLOSED: [
    { label: "Reopen Tickets",          newState: "TICKET_OPEN",         variant: "purple",    icon: <Ticket size={14}/> },
    { label: "Restart Registration",    newState: "REGISTRATION_OPEN",   variant: "secondary", icon: <RefreshCcw size={14}/>, confirm: "This reopens registration for new participants." },
    { label: "Start Event",             newState: "ONGOING",             variant: "danger",    icon: <Zap size={14}/>,    confirm: "Mark the event as live/ongoing?" },
  ],
  ONGOING: [
    { label: "End Event",         newState: "COMPLETED",         variant: "danger",   icon: <Square size={14}/>, confirm: "End this event? This cannot easily be undone." },
  ],
  PRIVATE: [
    { label: "Publish Event",    newState: "UPCOMING",           variant: "primary",  icon: <Eye size={14}/> },
    { label: "Make Unlisted",    newState: "UNLISTED",           variant: "secondary", icon: <EyeOff size={14}/> },
  ],
  DRAFT: [],
  APPLIED_FOR_APPROVAL: [],
  APPLIED_FOR_PRINCI_APPROVAL: [],
  COMPLETED: [],
};

const STATE_BADGE: Record<string, { label: string; cls: string }> = {
  DRAFT:                     { label: "Draft",               cls: "bg-zinc-500/20 text-zinc-400" },
  APPLIED_FOR_APPROVAL:      { label: "Awaiting Faculty",    cls: "bg-sky-500/20 text-sky-400" },
  APPLIED_FOR_PRINCI_APPROVAL:{ label: "Awaiting D/VP",      cls: "bg-amber-500/20 text-amber-400" },
  UNLISTED:                  { label: "Unlisted",            cls: "bg-violet-500/20 text-violet-400" },
  UPCOMING:                  { label: "Upcoming",            cls: "bg-blue-500/20 text-blue-400" },
  REGISTRATION_OPEN:         { label: "Registration Open",   cls: "bg-emerald-500/20 text-emerald-400" },
  REGISTRATION_CLOSED:       { label: "Registration Closed", cls: "bg-amber-500/20 text-amber-400" },
  TICKET_OPEN:               { label: "Tickets Live",        cls: "bg-violet-500/20 text-violet-400" },
  TICKET_CLOSED:             { label: "Tickets Closed",      cls: "bg-zinc-500/20 text-zinc-400" },
  ONGOING:                   { label: "Live Now",            cls: "bg-red-500/20 text-red-400" },
  COMPLETED:                 { label: "Completed",           cls: "bg-zinc-500/20 text-zinc-400" },
  PRIVATE:                   { label: "Private",             cls: "bg-zinc-600/20 text-zinc-500" },
};

const VARIANT_CLS: Record<string, string> = {
  primary:   "bg-emerald-500 hover:bg-emerald-600 text-white",
  secondary: "bg-surface2 hover:bg-border-c text-tx border border-border-c",
  danger:    "bg-red-500 hover:bg-red-600 text-white",
  warning:   "bg-amber-500 hover:bg-amber-600 text-white",
  purple:    "bg-violet-500 hover:bg-violet-600 text-white",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border-c rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-muted-tx">{icon}</span>
        <h2 className="text-tx font-fira font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, description, checked, onChange, disabled }: {
  label: string; description?: string; checked: boolean;
  onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border-c last:border-0">
      <div>
        <p className="text-tx text-sm font-fira">{label}</p>
        {description && <p className="text-subtle-tx text-xs font-fira mt-0.5">{description}</p>}
      </div>
      <button type="button" onClick={() => !disabled && onChange(!checked)} disabled={disabled}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-red-500" : "bg-border-c"} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function NumberInput({ label, description, value, onChange, min, max, disabled }: {
  label: string; description?: string; value: number | null; onChange: (v: number | null) => void;
  min?: number; max?: number; disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border-c last:border-0">
      <div>
        <p className="text-tx text-sm font-fira">{label}</p>
        {description && <p className="text-subtle-tx text-xs font-fira mt-0.5">{description}</p>}
      </div>
      <input type="number" value={value ?? ""} min={min} max={max} disabled={disabled}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="w-24 bg-bg border border-border-c rounded-xl px-3 py-1.5 text-sm font-fira text-tx text-right outline-none focus:border-red-500/50 disabled:opacity-40"
      />
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-bg rounded-xl p-3 flex flex-col gap-1">
      <p className="text-subtle-tx text-xs font-fira">{label}</p>
      <p className="text-tx text-xl font-fira font-bold">{value}</p>
      {sub && <p className="text-muted-tx text-xs font-fira">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventControlsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { events, refreshEvents } = useData();

  const [event, setEvent]           = useState<EventData | null>(events.find(e => String(e.id) === id) ?? null);
  const [stats, setStats]           = useState<EventControlStats | null>(null);
  const [loading, setLoading]       = useState(!event);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirm, setConfirm]       = useState<{ msg: string; onConfirm: () => void } | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  // Local settings state
  const [ticketCount, setTicketCount]     = useState<number | null>(null);
  const [fee, setFee]                     = useState<number>(0);
  const [maPpt, setMaPpt]                 = useState<number>(1);
  const [minPpt, setMinPpt]               = useState<number>(1);
  const [somaiyaOnly, setSomaiyaOnly]     = useState(true);
  const [ticketEnabled, setTicketEnabled] = useState(true);
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const [moreDetailsEnabled, setMoreDetailsEnabled] = useState(false);
  const [registrationFields, setRegistrationFields] = useState<RegistrationField[]>([]);
  const [submissionEnabled, setSubmissionEnabled]   = useState(false);
  const [regType, setRegType]             = useState<"ONPLATFORM" | "EXTERNAL">("ONPLATFORM");
  const [extLink, setExtLink]             = useState("");

  // Bulk control state
  const [bulkCount, setBulkCount]         = useState<string>("");
  const [ticketBulkCount, setTicketBulkCount] = useState<string>("");
  const [bulkLoading, setBulkLoading]     = useState<string | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const loadStats = useCallback(async () => {
    try {
      const s = await fetchEventStats(id);
      setStats(s);
    } catch { /* ignore */ }
  }, [id]);

  // Load event + stats
  useEffect(() => {
    if (!event) {
      setLoading(true);
      fetchEvent(id).then(ev => {
        setEvent(ev);
        syncSettings(ev);
      }).catch(() => {}).finally(() => setLoading(false));
    } else {
      syncSettings(event);
    }
    loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function syncSettings(ev: EventData) {
    setTicketCount(ev.ticket_count || null);
    setFee(ev.fee ?? 0);
    setMaPpt(ev.ma_ppt ?? 1);
    setMinPpt(ev.min_ppt ?? 1);
    setSomaiyaOnly(ev.is_only_somaiya ?? true);
    setTicketEnabled(ev.is_ticket_feature_enabled ?? true);
    setFeedbackEnabled(ev.is_feedback_enabled ?? false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setMoreDetailsEnabled((ev as any).more_details_enabled ?? false);
    setRegistrationFields((ev as any).registration_fields ?? []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSubmissionEnabled((ev as any).is_submission_enabled ?? false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setRegType(((ev as any).registration_type ?? "ONPLATFORM") as "ONPLATFORM" | "EXTERNAL");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setExtLink((ev as any).external_registration_link ?? "");
  }

  async function handleTransition(newState: string, confirmMsg?: string) {
    if (confirmMsg) {
      setConfirm({ msg: confirmMsg, onConfirm: () => { setConfirm(null); doTransition(newState); } });
    } else {
      doTransition(newState);
    }
  }

  async function doTransition(newState: string) {
    setTransitioning(true);
    try {
      await transitionEventState(id, newState);
      const updated = await fetchEvent(id);
      setEvent(updated);
      await refreshEvents();
      showToast(`State updated to ${STATE_BADGE[newState]?.label ?? newState}`);
      loadStats();
    } catch {
      showToast("Transition failed — please try again.", false);
    } finally {
      setTransitioning(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      await updateEventSettings(id, {
        ticket_count: ticketCount,
        fee,
        ma_ppt: maPpt,
        min_ppt: minPpt,
        is_only_somaiya: somaiyaOnly,
        is_ticket_feature_enabled: ticketEnabled,
        is_feedback_enabled: feedbackEnabled,
        more_details_enabled: moreDetailsEnabled,
        registration_fields: normalizeRegistrationFields(registrationFields),
        is_submission_enabled: submissionEnabled,
        registration_type: regType,
        external_registration_link: extLink,
      });
      await refreshEvents();
      showToast("Settings saved!");
    } catch {
      showToast("Failed to save settings.", false);
    } finally {
      setSaving(false);
    }
  }

  async function handleBulkIssue() {
    const count = ticketBulkCount ? parseInt(ticketBulkCount) : undefined;
    setBulkLoading("issue");
    try {
      const { issued } = await bulkIssueTickets(id, count);
      showToast(`Issued ${issued} ticket(s) successfully!`);
      loadStats();
    } catch {
      showToast("Failed to issue tickets.", false);
    } finally {
      setBulkLoading(null);
    }
  }

  async function handleBulkMarkPaid() {
    const count = bulkCount ? parseInt(bulkCount) : undefined;
    setBulkLoading("paid");
    try {
      const { updated } = await bulkMarkPaid(id, count);
      showToast(`Marked ${updated} participant(s) as paid!`);
      loadStats();
    } catch {
      showToast("Failed to mark as paid.", false);
    } finally {
      setBulkLoading(null);
    }
  }

  async function handleExport() {
    setBulkLoading("export");
    try {
      await downloadParticipantsCsv(id, event?.name);
    } catch {
      showToast("Export failed.", false);
    } finally {
      setBulkLoading(null);
    }
  }

  if (loading) return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 animate-pulse space-y-4">
      <div className="h-8 bg-surface rounded-xl w-64" />
      {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-surface rounded-2xl" />)}
    </div>
  );

  if (!event) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-muted-tx font-fira">Event not found.</p>
      <Link href="/" className="text-red-500 font-fira text-sm hover:underline">← Back to home</Link>
    </div>
  );

  const badge = STATE_BADGE[event.state] ?? { label: event.state, cls: "bg-zinc-500/20 text-zinc-400" };
  const actions = STATE_ACTIONS[event.state] ?? [];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 sm:py-8 pb-16">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 shadow-xl rounded-xl px-4 py-3 text-sm font-fira flex items-center gap-2 border ${toast.ok ? "bg-surface border-border-c text-tx" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
          {toast.ok ? <CheckCircle2 size={15} className="text-emerald-500" /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Confirm dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-border-c rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <p className="text-tx font-fira font-semibold">Are you sure?</p>
            <p className="text-muted-tx text-sm font-fira">{confirm.msg}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-fira bg-surface2 hover:bg-border-c text-tx border border-border-c transition-colors">
                Cancel
              </button>
              <button onClick={confirm.onConfirm}
                className="flex-1 py-2.5 rounded-xl text-sm font-fira bg-red-500 hover:bg-red-600 text-white transition-colors">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-5">
        <button type="button" onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-surface border border-border-c hover:bg-surface2 transition-colors shrink-0">
          <ArrowLeft size={17} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-tx font-marcellus text-lg sm:text-xl truncate">{event.name}</h1>
            <span className={`text-[11px] font-fira px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>{badge.label}</span>
          </div>
          <p className="text-subtle-tx text-xs font-fira mt-0.5">Event Controls</p>
        </div>
        <Link href={`/new-event/${event.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-fira text-muted-tx hover:text-tx bg-surface border border-border-c rounded-xl transition-colors shrink-0">
          <Edit2 size={12} /> Edit Event
        </Link>
      </div>

      {/* ── Live stats strip (full width) ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatBox label="Registered"    value={stats.total}    sub={ticketCount ? `/ ${ticketCount} cap` : undefined} />
          <StatBox label="Paid"          value={stats.paid}     sub={`${stats.pending} pending`} />
          <StatBox label="Tickets Issued" value={stats.ticketed} sub={stats.ticket_count ? `/ ${stats.ticket_count} cap` : undefined} />
          <StatBox label="Attended"      value={stats.attended} />
        </div>
      )}

      {/* ── Two-column body (desktop) / stacked (mobile) ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ── LEFT COLUMN — Actions ── */}
        <div className="w-full lg:w-[340px] shrink-0 space-y-5">

          {/* Lifecycle Controls */}
          <SectionCard title="Lifecycle Controls" icon={<Zap size={16} />}>
            {actions.length === 0 ? (
              <p className="text-subtle-tx text-sm font-fira">
                {["DRAFT","APPLIED_FOR_APPROVAL","APPLIED_FOR_PRINCI_APPROVAL"].includes(event.state)
                  ? "Event is in the approval pipeline. Use the Action Inbox to advance."
                  : "No further lifecycle actions available for this state."}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {actions.map((action) => (
                  <button key={action.newState} type="button"
                    onClick={() => handleTransition(action.newState, action.confirm)}
                    disabled={transitioning}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-fira font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLS[action.variant]}`}>
                    <span className="flex items-center gap-2">{action.icon} {action.label}</span>
                    {transitioning ? <RefreshCcw size={14} className="animate-spin" /> : <ChevronRight size={14} />}
                  </button>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Payment Controls */}
          <SectionCard title="Payment Controls" icon={<CreditCard size={16} />}>
            <p className="text-subtle-tx text-xs font-fira mb-4">
              Mark offline / cash payments as manually paid. Affects eligibility for ticket issuing.
            </p>
            <div className="space-y-3">
              <p className="text-tx text-sm font-fira font-semibold">Mark first N as paid</p>
              <div className="flex gap-2">
                <input type="number" value={bulkCount} onChange={e => setBulkCount(e.target.value)}
                  placeholder="e.g. 100" min={1}
                  className="w-28 bg-bg border border-border-c rounded-xl px-3 py-2 text-sm font-fira text-tx outline-none focus:border-red-500/50" />
                <button type="button" onClick={handleBulkMarkPaid} disabled={bulkLoading === "paid"}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-fira font-semibold disabled:opacity-50 transition-colors">
                  {bulkLoading === "paid" ? <RefreshCcw size={13} className="animate-spin" /> : <CreditCard size={13} />}
                  Mark as Paid
                </button>
              </div>
              <p className="text-subtle-tx text-[11px] font-fira">
                Only PENDING records updated · ordered by registration date (earliest first).
              </p>
            </div>
          </SectionCard>

          {/* Quick Actions */}
          <SectionCard title="Quick Actions" icon={<Zap size={16} />}>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Participants",  icon: <Users size={14} />,       href: `/participants?event=${id}` },
                { label: "Attendance",    icon: <ClipboardList size={14}/>, href: `/attendance?event=${id}` },
                { label: "Budget",        icon: <BarChart2 size={14} />,    href: `/budget?event=${id}` },
                { label: "Announcements", icon: <Send size={14} />,         href: `/announcements?event=${id}` },
                { label: "Statistics",    icon: <BarChart2 size={14} />,    href: `/statistics?event=${id}` },
                { label: "Edit Event",    icon: <Edit2 size={14} />,        href: `/new-event/${id}` },
              ].map(({ label, icon, href }) => (
                <Link key={label} href={href}
                  className="flex items-center gap-2 px-3 py-2.5 bg-bg border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx text-xs font-fira rounded-xl transition-colors">
                  {icon} {label}
                </Link>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border-c">
              <button type="button" onClick={handleExport} disabled={bulkLoading === "export"}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface2 hover:bg-border-c text-tx text-sm font-fira border border-border-c transition-colors disabled:opacity-50">
                {bulkLoading === "export" ? <RefreshCcw size={13} className="animate-spin" /> : <Download size={13} />}
                Export Participants CSV
              </button>
            </div>
          </SectionCard>

        </div>

        {/* ── RIGHT COLUMN — Settings ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Registration & Capacity */}
          <SectionCard title="Registration & Capacity" icon={<Users size={16} />}>
            <NumberInput label="Registration Cap" description="Max students who can register (blank = unlimited)"
              value={ticketCount} onChange={setTicketCount} min={0} />
            <NumberInput label="Entry Fee (₹)" description="0 = free event"
              value={fee} onChange={(v) => setFee(v ?? 0)} min={0} />
            <NumberInput label="Max team size" description="Set 1 for solo events"
              value={maPpt} onChange={(v) => setMaPpt(v ?? 1)} min={1} />
            <NumberInput label="Min team size" description="Minimum for submission"
              value={minPpt} onChange={(v) => setMinPpt(v ?? 1)} min={1} />
            <Toggle label="Somaiya Students Only" description="Restrict to @somaiya.edu"
              checked={somaiyaOnly} onChange={setSomaiyaOnly} />
            <Toggle label="More Details Form" description="Show custom fields during registration"
              checked={moreDetailsEnabled} onChange={(v) => {
                setMoreDetailsEnabled(v);
                if (v && registrationFields.length === 0) {
                  setRegistrationFields([{ id: "", label: "", type: "text", required: true }]);
                }
              }} />
            {moreDetailsEnabled && (
              <RegistrationFieldsEditor
                fields={registrationFields}
                onChange={setRegistrationFields}
              />
            )}
            <Toggle label="Submission Enabled" description="Allow teams to submit work"
              checked={submissionEnabled} onChange={setSubmissionEnabled} />
            <div className="py-3">
              <p className="text-tx text-sm font-fira mb-2">Registration Type</p>
              <div className="flex gap-2">
                {(["ONPLATFORM", "EXTERNAL"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setRegType(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-fira border transition-colors ${regType === t ? "bg-red-500 border-red-500 text-white" : "bg-bg border-border-c text-muted-tx hover:border-red-500/30"}`}>
                    {t === "ONPLATFORM" ? "On Platform" : "External Link"}
                  </button>
                ))}
              </div>
              {regType === "EXTERNAL" && (
                <input type="url" value={extLink} onChange={e => setExtLink(e.target.value)}
                  placeholder="https://forms.google.com/..."
                  className="mt-2 w-full bg-bg border border-border-c rounded-xl px-3 py-2 text-sm font-fira text-tx outline-none focus:border-red-500/50" />
              )}
            </div>
          </SectionCard>

          {/* Ticket Controls */}
          <SectionCard title="Ticket Controls" icon={<Ticket size={16} />}>
            <Toggle label="Ticket Feature" description="Enable ticket claiming for this event"
              checked={ticketEnabled} onChange={setTicketEnabled} />
            <NumberInput label="Ticket Cap" description="Max tickets that can be claimed (blank = unlimited)"
              value={ticketCount} onChange={setTicketCount} min={0} />
            <div className="pt-4 pb-1 space-y-3">
              <p className="text-tx text-sm font-fira font-semibold">Bulk Issue Tickets</p>
              <p className="text-subtle-tx text-xs font-fira">Issue tickets to the first N paid participants (blank = all eligible).</p>
              <div className="flex gap-2">
                <input type="number" value={ticketBulkCount} onChange={e => setTicketBulkCount(e.target.value)}
                  placeholder="e.g. 50" min={1}
                  className="w-28 bg-bg border border-border-c rounded-xl px-3 py-2 text-sm font-fira text-tx outline-none focus:border-red-500/50" />
                <button type="button" onClick={handleBulkIssue} disabled={bulkLoading === "issue"}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-fira font-semibold disabled:opacity-50 transition-colors">
                  {bulkLoading === "issue" ? <RefreshCcw size={13} className="animate-spin" /> : <Ticket size={13} />}
                  Issue Tickets
                </button>
              </div>
            </div>
            <Toggle label="Feedback Enabled" description="Show post-event feedback form to participants"
              checked={feedbackEnabled} onChange={setFeedbackEnabled} />
          </SectionCard>

          {/* Save Settings */}
          <button type="button" onClick={saveSettings} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-fira font-semibold text-sm disabled:opacity-50 transition-colors">
            {saving ? <RefreshCcw size={15} className="animate-spin" /> : <Settings size={15} />}
            {saving ? "Saving…" : "Save All Settings"}
          </button>

        </div>
      </div>

    </div>
  );
}
