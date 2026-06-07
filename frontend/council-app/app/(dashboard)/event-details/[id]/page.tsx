"use client";
import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getNextAction, type EventData, type EventDocument, type ApprovalStep } from "@/lib/dummy-data";
import { fetchEvent, fetchDocuments, addDocument, deleteDocument, transitionEventState, fetchCouncilProfile, mapStateToPipeline, type DocumentRow, type FacultyAdvisorRow } from "@/lib/api";
import FacultyReviewerSelect from "@/components/FacultyReviewerSelect";
import { uploadFile, type UploadType } from "@/lib/upload";
import { useData } from "@/contexts/DataContext";
import {
  ArrowLeft, CalendarDays, MapPin, Users, Ticket, Edit2, ExternalLink,
  Upload, CheckCircle2, Clock, AlertCircle, XCircle, FileText,
  ChevronRight, Share2, BarChart2, ClipboardList, Send, Settings,
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
  DRAFT:                       <FileText       size={14} />,
  APPLIED_FOR_APPROVAL:        <Send           size={14} />,
  APPLIED_FOR_PRINCI_APPROVAL: <CheckCircle2   size={14} />,
  UNLISTED:                    <CheckCircle2   size={14} />,
  PROPOSAL_SUBMITTED:          <Send           size={14} />,
  PROPOSAL_APPROVED:   <CheckCircle2   size={14} />,
  BOOKING_PENDING:     <ArrowLeft      size={14} className="rotate-180" />,
  DIRECTOR_VP_PENDING: <Users          size={14} />,
  FULLY_APPROVED:      <CheckCircle2   size={14} />,
  REGISTRATION_OPEN:   <Ticket         size={14} />,
  REGISTRATION_CLOSED: <Clock          size={14} />,
  TICKET_OPEN:         <Ticket         size={14} />,
  TICKET_CLOSED:       <Clock          size={14} />,
  ONGOING:             <ArrowLeft      size={14} className="rotate-180" />,
  COMPLETED:           <CheckCircle2   size={14} />,
  REPORT_SUBMITTED:    <FileText       size={14} />,
  PRIVATE:             <Settings       size={14} />,
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
          <div key={`${step.stage}-${i}`} className="flex gap-4">
            {/* Step number + icon + vertical connector */}
            <div className="flex flex-col items-center shrink-0">
              <span className="text-[10px] font-fira text-subtle-tx mb-1">{i + 1}</span>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 ${iconBg}`}>
                {step.status === "rejected" ? <XCircle size={15} /> : (STAGE_ICON[step.stage] ?? STAGE_ICON[mapStateToPipeline(step.stage)] ?? <Clock size={15} />)}
              </div>
              {!isLast && (
                <div className="flex flex-col items-center my-1 min-h-[2rem]">
                  <div className="w-px flex-1 bg-border-c" />
                  <ChevronRight size={12} className="text-subtle-tx rotate-90 shrink-0 my-0.5" />
                  <div className="w-px flex-1 bg-border-c" />
                </div>
              )}
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

function docUploadType(type: string): UploadType {
  if (type === "report")              return "eventio-reports";
  if (type === "geo_tag")             return "eventio-event-images";
  if (["proposal", "noc", "budget", "letter", "other"].includes(type))
                                      return "eventio-approval-documents";
  return "eventio-approval-documents";
}

function DocumentRow({ doc, eventId, onUpdated }: {
  doc: EventDocument & { url?: string; uploaded_at?: string };
  eventId: string;
  onUpdated: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr]             = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      const url = await uploadFile(file, docUploadType(doc.type));
      await addDocument({ event_id: Number(eventId), name: doc.name, type: doc.type, url });
      onUpdated(url);
    } catch {
      setErr("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 p-3 bg-surface2 border border-border-c rounded-xl">
        <span className="text-lg shrink-0">{DOC_ICON[doc.type] ?? "📎"}</span>
        <div className="flex-1 min-w-0">
          <p className="text-tx text-sm font-fira font-medium truncate">{doc.name}</p>
          <p className="text-subtle-tx text-[11px] font-fira">
            {doc.uploaded_at
              ? `Uploaded ${new Date(doc.uploaded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
              : <span className="text-amber-500">Not uploaded</span>}
            {doc.required && !doc.uploaded_at && " · Required"}
          </p>
        </div>
        <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={handleFile} />
        {doc.url ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <a href={doc.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-surface border border-border-c text-muted-tx hover:text-tx text-xs font-fira rounded-lg transition-all">
              <ExternalLink size={11} /> View
            </a>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-surface border border-border-c text-muted-tx hover:text-red-500 hover:border-red-500/30 text-xs font-fira rounded-lg transition-all disabled:opacity-60">
              <Upload size={11} /> {uploading ? "…" : "Replace"}
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-fira rounded-lg transition-all disabled:opacity-60">
            <Upload size={11} /> {uploading ? "Uploading…" : "Upload"}
          </button>
        )}
      </div>
      {err && <p className="text-red-500 text-xs font-fira px-1">{err}</p>}
    </div>
  );
}

function DocumentsPanel({ docs, eventId, onDocUpdated }: {
  docs: (EventDocument & { url?: string; uploaded_at?: string })[];
  eventId: string;
  onDocUpdated: (docId: string, url: string) => void;
}) {
  return (
    <div className="space-y-2">
      {docs.map(doc => (
        <DocumentRow key={doc.id} doc={doc} eventId={eventId} onUpdated={(url) => onDocUpdated(String(doc.id), url)} />
      ))}
    </div>
  );
}

const DOC_TYPES = [
  { value: "proposal", label: "Proposal" },
  { value: "noc",      label: "NOC" },
  { value: "budget",   label: "Budget" },
  { value: "letter",   label: "Letter" },
  { value: "report",   label: "Report" },
  { value: "geo_tag",  label: "Geo-Tag Photo" },
  { value: "other",    label: "Other" },
] as const;

type DocType = typeof DOC_TYPES[number]["value"];

function AddDocumentSection({ eventId, docs, onDocUpdated, onDocAdded }: {
  eventId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  docs: any[];
  onDocUpdated: (id: string, url: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDocAdded: (doc: any) => void;
}) {
  const addFileRef = useRef<HTMLInputElement>(null);
  const [addType, setAddType]         = useState<DocType>("other");
  const [addName, setAddName]         = useState("");
  const [addUploading, setAddUploading] = useState(false);
  const [addErr, setAddErr]           = useState("");
  const [showForm, setShowForm]       = useState(false);

  async function handleAddFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAddUploading(true);
    setAddErr("");
    try {
      const url = await uploadFile(file, docUploadType(addType));
      const name = addName.trim() || file.name;
      const saved = await addDocument({ event_id: Number(eventId), name, type: addType, url });
      onDocAdded({ ...(saved ?? {}), name, type: addType, url, uploaded_at: new Date().toISOString() });
      setAddName("");
      setShowForm(false);
    } catch {
      setAddErr("Upload failed. Please try again.");
    } finally {
      setAddUploading(false);
      e.target.value = "";
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-tx font-fira font-semibold text-sm">Documents</h3>
        <button type="button" onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface2 border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx text-xs font-fira rounded-lg transition-all">
          <Upload size={12} /> Add Document
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 bg-surface2 border border-border-c rounded-xl space-y-3">
          <p className="text-tx text-xs font-fira font-semibold">Upload New Document</p>
          <div className="flex gap-2">
            <select value={addType} onChange={e => setAddType(e.target.value as DocType)}
              className="flex-1 bg-surface border border-border-c rounded-lg px-3 py-2 text-sm font-fira text-tx outline-none focus:border-red-500/40">
              {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input type="text" placeholder="Document name (optional)" value={addName} onChange={e => setAddName(e.target.value)}
              className="flex-1 bg-surface border border-border-c rounded-lg px-3 py-2 text-sm font-fira text-tx outline-none focus:border-red-500/40 placeholder-subtle-tx" />
          </div>
          <input ref={addFileRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={handleAddFile} />
          <button type="button" onClick={() => addFileRef.current?.click()} disabled={addUploading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-fira font-semibold rounded-xl transition-colors disabled:opacity-60">
            <Upload size={14} /> {addUploading ? "Uploading…" : "Choose File & Upload"}
          </button>
          {addErr && <p className="text-red-500 text-xs font-fira">{addErr}</p>}
        </div>
      )}

      {docs.length === 0 && !showForm
        ? <p className="text-muted-tx text-sm font-fira text-center py-8">No documents yet. Click &ldquo;Add Document&rdquo; to upload one.</p>
        : <DocumentsPanel docs={docs} eventId={eventId} onDocUpdated={onDocUpdated} />
      }
    </>
  );
}

// ─── Next Action Panel ────────────────────────────────────────────────────────

function NextActionPanel({ event, onAction, actionLoading, advisors, selectedFaculty, onFacultyChange }: {
  event: EventData;
  onAction: (cta: string) => void;
  actionLoading?: boolean;
  advisors: FacultyAdvisorRow[];
  selectedFaculty: string[];
  onFacultyChange: (emails: string[]) => void;
}) {
  const action = getNextAction(event);
  if (!action || action.cta === "Check Status") return null;

  const needsFaculty =
    event.state === "DRAFT" &&
    (action.cta === "Submit Proposal" || action.cta === "Resubmit Proposal");

  return (
    <div className="rounded-2xl border p-5 bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-tx text-sm font-fira font-semibold mb-1">Next Step</p>
          <p className="text-muted-tx text-xs font-fira leading-relaxed">{action.label}</p>
        </div>
      </div>

      {needsFaculty && (
        <div className="mb-4 pb-4 border-b border-red-200/60 dark:border-red-500/20">
          <FacultyReviewerSelect
            advisors={advisors}
            selected={selectedFaculty}
            onChange={onFacultyChange}
            compact
          />
        </div>
      )}

      {action.route ? (
        <Link href={action.route}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-fira font-semibold transition-all bg-red-500 hover:bg-red-600 text-white">
          {action.cta} <ChevronRight size={14} />
        </Link>
      ) : (
        <button type="button" onClick={() => onAction(action.cta)} disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-fira font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-red-500 hover:bg-red-600 text-white">
          {actionLoading ? "Processing…" : action.cta}
          {!actionLoading && <ChevronRight size={14} />}
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();
  const { events, refreshEvents } = useData();

  const [event, setEvent]         = useState<EventData | null>(events.find(e => String(e.id) === id) ?? null);
  const [tab, setTab]             = useState<"journey" | "documents">("journey");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [docs, setDocs]           = useState<any[]>(event?.documents ?? []);
  const [toast, setToast]         = useState("");
  const [loading, setLoading]     = useState(!event);
  const [actionLoading, setActionLoading] = useState(false);
  const [advisors, setAdvisors] = useState<FacultyAdvisorRow[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string[]>([]);

  useEffect(() => {
    fetchCouncilProfile()
      .then((p) => setAdvisors(p.profile?.faculty_advisors ?? []))
      .catch(() => setAdvisors([]));
  }, []);

  useEffect(() => {
    if (event?.assigned_faculty_emails?.length) {
      setSelectedFaculty(event.assigned_faculty_emails);
    }
  }, [event?.id, event?.assigned_faculty_emails]);

  useEffect(() => {
    if (event) {
      // also load real documents
      fetchDocuments(id).then(d => setDocs(d)).catch(() => {});
      return;
    }
    setLoading(true);
    fetchEvent(id)
      .then(ev => { setEvent(ev); setDocs(ev.documents ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchDocuments(id).then(d => { if (d.length) setDocs(d); }).catch(() => {});
  }, [id]);

  if (loading) return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 animate-pulse space-y-4">
      <div className="h-48 bg-surface rounded-2xl" />
      <div className="h-10 bg-surface rounded-xl w-64" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-surface rounded-xl" />)}
      </div>
    </div>
  );

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

  const STATE_TRANSITIONS: Record<string, string> = {
    "Submit Proposal":   "APPLIED_FOR_APPROVAL",
    "Resubmit Proposal": "APPLIED_FOR_APPROVAL",
    "Open Registration": "REGISTRATION_OPEN",
  };

  async function handleAction(cta: string) {
    const newState = STATE_TRANSITIONS[cta];
    if (newState) {
      if (actionLoading) return;
      if (
        (cta === "Submit Proposal" || cta === "Resubmit Proposal") &&
        selectedFaculty.length === 0
      ) {
        showToast("Select at least one faculty advisor before submitting.");
        return;
      }
      setActionLoading(true);
      try {
        await transitionEventState(
          id,
          newState,
          cta === "Submit Proposal" || cta === "Resubmit Proposal"
            ? { assigned_faculty_emails: selectedFaculty }
            : undefined,
        );
        // refresh local event + global list
        const updated = await fetchEvent(id);
        setEvent(updated);
        await refreshEvents();
        showToast(
          cta === "Submit Proposal" ? "Proposal submitted to faculty advisor!" :
          cta === "Resubmit Proposal" ? "Revised proposal resubmitted to faculty!" :
          cta === "Open Registration" ? "Registration is now open!" :
          "Updated successfully."
        );
      } catch {
        showToast("Action failed — please try again.");
      } finally {
        setActionLoading(false);
      }
    } else if (cta === "Upload Documents" || cta === "Submit Report") {
      setTab("documents");
      if (cta === "Submit Report") showToast("Upload your post-event report in the Documents tab.");
    } else {
      showToast(`${cta} — action triggered!`);
    }
  }

  function handleDocUpdated(docId: string, url: string) {
    setDocs(prev => prev.map(d =>
      String(d.id) === docId ? { ...d, url, uploaded_at: new Date().toISOString() } : d
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
          <Link href={`/controls/${event.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/80 backdrop-blur-sm text-white text-xs font-fira rounded-lg hover:bg-red-500 transition-all">
            <Settings size={13} /> Controls
          </Link>
          <Link href={`/new-event/${event.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-fira rounded-lg hover:bg-black/70 transition-all">
            <Edit2 size={13} /> Edit
          </Link>
        </div>
        {/* Name */}
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-fira uppercase tracking-widest bg-red-500/80 text-white px-2 py-0.5 rounded-md">{(event.event_type ?? "EVENT").replace(/_/g," ")}</span>
          </div>
          <h1 className="text-white text-xl sm:text-3xl font-marcellus">{event.name}</h1>
          <p className="text-white/70 text-sm font-fira mt-0.5">{event.tag_line}</p>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-7xl mx-auto">
        {/* Faculty / principal feedback when sent back for changes */}
        {event.comment && (
          <div className="mb-6 p-4 sm:p-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-2xl flex gap-3">
            <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-amber-800 dark:text-amber-300 text-sm font-fira font-semibold mb-1">
                Changes requested by {event.state === "DRAFT" ? "faculty / principal" : "reviewer"}
              </p>
              <p className="text-muted-tx text-sm font-fira leading-relaxed italic">
                &ldquo;{event.comment}&rdquo;
              </p>
              {event.state === "DRAFT" && (
                <Link href={`/new-event/${event.id}`}
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-fira font-semibold text-amber-700 dark:text-amber-400 hover:underline">
                  <Edit2 size={12} /> Edit event &amp; resubmit →
                </Link>
              )}
            </div>
          </div>
        )}

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
                <AddDocumentSection eventId={id} docs={docs} onDocUpdated={handleDocUpdated} onDocAdded={(doc) => setDocs(prev => [...prev, doc])} />
              )}

            </div>
          </div>

          {/* ── Right: sidebar ── */}
          <div className="space-y-4">
            {/* Next action */}
            <NextActionPanel
              event={event}
              onAction={handleAction}
              actionLoading={actionLoading}
              advisors={advisors}
              selectedFaculty={selectedFaculty}
              onFacultyChange={setSelectedFaculty}
            />

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
                  { label: "Event Controls",icon: <Settings size={14} />,   href: `/controls/${event.id}` },
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
