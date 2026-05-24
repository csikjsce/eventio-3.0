"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getEventById, getNextAction,
  type EventData, type EventDocument, type ApprovalStep,
} from "@/lib/dummy-data";
import {
  ArrowLeft, CalendarDays, MapPin, Users, Ticket, Edit2, ExternalLink,
  Upload, CheckCircle2, Clock, AlertCircle, XCircle, FileText,
  ChevronRight, Share2, BarChart2, ClipboardList, Send,
} from "lucide-react";

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const DOC_ICON: Record<string, string> = {
  proposal: "📄", noc: "🏛️", budget: "💰", letter: "📜", report: "📊", geo_tag: "📸", other: "📎",
};

// ─── Approval timeline ────────────────────────────────────────────────────────

const STAGE_ICON: Record<string, React.ReactNode> = {
  PROPOSAL_SUBMITTED:  <Send           size={14} />,
  PROPOSAL_APPROVED:   <CheckCircle2   size={14} />,
  BOOKING_PENDING:     <ArrowLeft      size={14} className="rotate-180" />,
  DIRECTOR_VP_PENDING: <Users          size={14} />,
  FULLY_APPROVED:      <CheckCircle2   size={14} />,
  REGISTRATION_OPEN:   <Ticket         size={14} />,
  REGISTRATION_CLOSED: <Clock          size={14} />,
  ONGOING:             <ArrowLeft      size={14} className="rotate-180" />,
  COMPLETED:           <CheckCircle2   size={14} />,
  REPORT_SUBMITTED:    <FileText       size={14} />,
};

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
    ", " + new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function ApprovalTimeline({ chain }: { chain: ApprovalStep[] }) {
  if (chain.length === 0) return (
    <div className="text-center py-8 text-muted-tx text-sm font-fira">
      No approval actions yet. Submit the proposal to start the journey.
    </div>
  );
  return (
    <div>
      {chain.map((step, i) => {
        const isLast = i === chain.length - 1;
        const iconBg =
          step.status === "done"      ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          : step.status === "active"  ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400"
          : step.status === "rejected"? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-500"
          : "bg-surface2 border-border-c text-subtle-tx";

        return (
          <div key={i} className="flex gap-4">
            {/* Icon + vertical connector */}
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 ${iconBg}`}>
                {step.status === "rejected" ? <XCircle size={15} /> : (STAGE_ICON[step.stage] ?? <Clock size={15} />)}
              </div>
              {!isLast && <div className="w-px flex-1 bg-border-c my-1 min-h-[2rem]" />}
            </div>

            {/* Content + date */}
            <div className={`flex-1 flex items-start justify-between gap-3 min-w-0 ${isLast ? "pb-0" : "pb-5"}`}>
              <div className="min-w-0">
                <p className="text-tx text-sm font-fira font-semibold leading-snug">{step.label}</p>
                <p className="text-muted-tx text-xs font-fira mt-0.5">{step.actor}</p>
                {step.note && (
                  <div className="mt-2 px-3 py-2 bg-surface2 border border-border-c rounded-lg">
                    <p className="text-muted-tx text-xs font-fira italic">&ldquo;{step.note}&rdquo;</p>
                  </div>
                )}
              </div>
              {step.date && (
                <p className="text-subtle-tx text-[11px] font-fira shrink-0 mt-0.5 text-right">{fmtShort(step.date)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Documents ────────────────────────────────────────────────────────────────

function DocumentsPanel({ docs, onUpload }: { docs: EventDocument[]; onUpload: (id: string) => void }) {
  return (
    <div className="space-y-2">
      {docs.map(doc => (
        <div key={doc.id} className="flex items-center gap-3 p-3 bg-surface2 border border-border-c rounded-xl">
          <span className="text-lg shrink-0">{DOC_ICON[doc.type] ?? "📎"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-tx text-sm font-fira font-medium truncate">{doc.name}</p>
            <p className="text-subtle-tx text-[11px] font-fira">
              {doc.uploaded_at ? `Uploaded ${doc.uploaded_at}` : <span className="text-amber-500">Not uploaded</span>}
              {doc.required && !doc.uploaded_at && " · Required"}
            </p>
          </div>
          {doc.url ? (
            <a href={doc.url} target="_blank" rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-surface border border-border-c text-muted-tx hover:text-tx text-xs font-fira rounded-lg transition-all">
              <ExternalLink size={11} /> View
            </a>
          ) : (
            <button type="button" onClick={() => onUpload(doc.id)}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-surface border border-border-c text-muted-tx hover:text-red-500 hover:border-red-500/30 text-xs font-fira rounded-lg transition-all">
              <Upload size={11} /> Upload
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Next Action Panel ────────────────────────────────────────────────────────

function NextActionPanel({ event, onAction }: { event: EventData; onAction: (cta: string) => void }) {
  const action = getNextAction(event);
  if (!action) return null;

  const isWaiting = action.cta === "Check Status";

  return (
    <div className={`rounded-2xl border p-5 ${isWaiting ? "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20" : "bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20"}`}>
      <div className="flex items-start gap-3 mb-4">
        {isWaiting
          ? <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
          : <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
        }
        <div>
          <p className="text-tx text-sm font-fira font-semibold mb-1">Next Step</p>
          <p className="text-muted-tx text-xs font-fira leading-relaxed">{action.label}</p>
        </div>
      </div>
      {action.route ? (
        <Link href={action.route}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-fira font-semibold transition-all ${isWaiting ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}>
          {action.cta} <ChevronRight size={14} />
        </Link>
      ) : (
        <button type="button" onClick={() => onAction(action.cta)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-fira font-semibold transition-all ${isWaiting ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}>
          {action.cta} <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const event = getEventById(Number(id));
  const [tab, setTab] = useState<"journey" | "documents">("journey");
  const [docs, setDocs] = useState(event?.documents ?? []);
  const [toast, setToast] = useState("");

  if (!event) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-muted-tx font-fira">Event not found.</p>
      <Link href="/" className="text-red-500 font-fira text-sm hover:underline">← Back to home</Link>
    </div>
  );

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleAction(cta: string) {
    if (cta === "Submit Proposal") {
      showToast("Proposal submitted to faculty advisor!");
    } else if (cta === "Upload Documents") {
      setTab("documents");
    } else if (cta === "Forward to Director/VP") {
      showToast("Forwarded to Director / Vice Principal for approval!");
    } else if (cta === "Open Registration") {
      showToast("Registration opened!");
    } else if (cta === "Submit Report") {
      showToast("Use the Documents tab to upload the event report.");
      setTab("documents");
    } else {
      showToast(`${cta} — action triggered!`);
    }
  }

  function handleUpload(docId: string) {
    setDocs(prev => prev.map(d =>
      d.id === docId ? { ...d, url: "#", uploaded_at: new Date().toISOString().split("T")[0] } : d
    ));
    showToast("Document uploaded successfully!");
  }

  const ticketPct = event.ticket_count > 0 ? Math.round((event.tickets_sold ?? 0) / event.ticket_count * 100) : 0;

  return (
    <div className="min-h-screen bg-bg">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-surface border border-border-c shadow-xl rounded-xl px-4 py-3 text-tx text-sm font-fira flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-500" /> {toast}
        </div>
      )}

      {/* Hero banner */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img src={event.banner_url} alt={event.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        {/* Back */}
        <button type="button" onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-fira rounded-lg hover:bg-black/70 transition-all">
          <ArrowLeft size={13} /> Back
        </button>
        {/* Actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button type="button" onClick={() => showToast("Link copied!")}
            className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-all">
            <Share2 size={14} />
          </button>
          <Link href={`/new-event/${event.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-fira rounded-lg hover:bg-black/70 transition-all">
            <Edit2 size={13} /> Edit
          </Link>
        </div>
        {/* Name */}
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-fira uppercase tracking-widest bg-red-500/80 text-white px-2 py-0.5 rounded-md">{event.event_type.replace(/_/g," ")}</span>
          </div>
          <h1 className="text-white text-xl sm:text-3xl font-marcellus">{event.name}</h1>
          <p className="text-white/70 text-sm font-fira mt-0.5">{event.tag_line}</p>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── Left: main content ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* About card */}
            <div className="bg-surface border border-border-c rounded-2xl p-5 sm:p-6">
              <p className="text-muted-tx text-sm font-fira leading-relaxed">{event.long_description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  event.fee === 0 ? "Free Entry" : `₹${event.fee} Registration`,
                  event.is_only_somaiya ? "Somaiya Students Only" : "Open to All",
                  event.registration_type === "ONPLATFORM" ? "On-Platform Registration" : "External Registration",
                  event.is_feedback_enabled ? "Feedback Enabled" : null,
                  event.is_ticket_feature_enabled ? "Ticketed" : null,
                ].filter(Boolean).map(tag => (
                  <span key={tag!} className="text-[11px] font-fira px-2.5 py-1 bg-surface2 border border-border-c text-muted-tx rounded-full">{tag}</span>
                ))}
              </div>
            </div>

            {/* Key info strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <CalendarDays size={14} />, label: "Date", value: event.dates[0] ? fmtDate(event.dates[0]) : "TBD" },
                { icon: <Clock size={14} />, label: "Time", value: event.dates[0] ? fmtTime(event.dates[0]) : "TBD" },
                { icon: <MapPin size={14} />, label: "Venue", value: event.venue ?? "Online" },
                { icon: <Users size={14} />, label: "Team Size", value: event.min_ppt === event.ma_ppt ? `${event.min_ppt}` : `${event.min_ppt}–${event.ma_ppt}` },
              ].map(info => (
                <div key={info.label} className="bg-surface border border-border-c rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-subtle-tx mb-1">{info.icon}<p className="text-[10px] font-fira uppercase tracking-wide">{info.label}</p></div>
                  <p className="text-tx text-xs sm:text-sm font-fira font-semibold truncate">{info.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-surface border border-border-c rounded-xl w-fit">
              {(["journey", "documents"] as const).map(t => (
                <button key={t} type="button" onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-fira transition-all ${t === tab ? "bg-red-500 text-white font-semibold" : "text-muted-tx hover:text-tx"}`}>
                  {t === "journey" ? "Approval Journey" : `Documents (${docs.length})`}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-surface border border-border-c rounded-2xl p-5 sm:p-6">
              {tab === "journey" && (
                <>
                  <h3 className="text-tx font-fira font-semibold text-sm mb-5">Approval Chain</h3>
                  <ApprovalTimeline chain={event.approval_chain} />
                </>
              )}

              {tab === "documents" && (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-tx font-fira font-semibold text-sm">Documents</h3>
                    <button type="button"
                      onClick={() => {
                        const newDoc = { id: `d${Date.now()}`, name: "New Document.pdf", type: "other" as const, required: false };
                        setDocs(prev => [...prev, newDoc]);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-surface2 border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx text-xs font-fira rounded-lg transition-all">
                      <Upload size={12} /> Add Document
                    </button>
                  </div>
                  {docs.length === 0
                    ? <p className="text-muted-tx text-sm font-fira text-center py-8">No documents yet.</p>
                    : <DocumentsPanel docs={docs} onUpload={handleUpload} />
                  }
                </>
              )}

            </div>
          </div>

          {/* ── Right: sidebar ── */}
          <div className="space-y-4">
            {/* Next action */}
            <NextActionPanel event={event} onAction={handleAction} />

            {/* Ticket progress */}
            {event.is_ticket_feature_enabled && (
              <div className="bg-surface border border-border-c rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Ticket size={15} className="text-subtle-tx" />
                  <p className="text-tx text-sm font-fira font-semibold">Ticket Sales</p>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <p className="text-3xl font-bold text-tx font-fira">{event.tickets_sold ?? 0}</p>
                  <p className="text-subtle-tx text-xs font-fira">/ {event.ticket_count} seats</p>
                </div>
                <div className="h-2 bg-surface2 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${ticketPct}%` }} />
                </div>
                <p className="text-muted-tx text-xs font-fira mt-1.5">{ticketPct}% filled · {event.ticket_count - (event.tickets_sold ?? 0)} remaining</p>
              </div>
            )}

            {/* Quick links */}
            <div className="bg-surface border border-border-c rounded-2xl p-5">
              <p className="text-tx text-sm font-fira font-semibold mb-3">Quick Links</p>
              <div className="space-y-1">
                {[
                  { label: "Edit Event",   icon: <Edit2 size={14} />,       href: `/new-event/${event.id}` },
                  { label: "Participants", icon: <Users size={14} />,        href: `/participants?event=${event.id}` },
                  { label: "Statistics",  icon: <BarChart2 size={14} />,    href: `/statistics` },
                  { label: "Attendance",  icon: <ClipboardList size={14} />,href: `/attendance` },
                  { label: "Announce",    icon: <Send size={14} />,         href: `/announcements` },
                ].map(link => (
                  <Link key={link.label} href={link.href}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-fira text-muted-tx hover:text-tx hover:bg-surface2 transition-all">
                    <span className="text-subtle-tx">{link.icon}</span> {link.label}
                    <ChevronRight size={13} className="ml-auto" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Report / geo-tag */}
            {(event.report_url || event.geo_tag_url) && (
              <div className="bg-surface border border-border-c rounded-2xl p-5">
                <p className="text-tx text-sm font-fira font-semibold mb-3">Post-Event</p>
                <div className="space-y-2">
                  {event.report_url && (
                    <a href={event.report_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-fira text-muted-tx hover:text-tx hover:bg-surface2 transition-all">
                      <FileText size={14} className="text-subtle-tx" /> Event Report <ExternalLink size={11} className="ml-auto" />
                    </a>
                  )}
                  {event.geo_tag_url && (
                    <a href={event.geo_tag_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-fira text-muted-tx hover:text-tx hover:bg-surface2 transition-all">
                      <span className="text-subtle-tx text-sm">📸</span> Geo-tagged Photos <ExternalLink size={11} className="ml-auto" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
