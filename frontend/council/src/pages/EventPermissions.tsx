import { useContext, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Clock, AlertCircle,
  ChevronRight, MessageSquare, Send, FileText, Lock,
  Building2, GraduationCap, Users, ShieldCheck, Info,
  Download, Upload, Paperclip, X,
} from 'lucide-react';
import EventsDataContext from '../contexts/EventsDataContext';

// --- Permission forms definition ---------------------------------------------
interface PermForm {
  id: string;
  title: string;
  authority: string;
  description: string;
  required: boolean;
  templateUrl?: string;
}

const PERMISSION_FORMS: PermForm[] = [
  {
    id: 'venue',
    title: 'Venue Permission Letter',
    authority: 'College Administration',
    description: 'Request letter for booking the venue. Must be signed by the faculty advisor before submission.',
    required: true,
    templateUrl: '#',
  },
  {
    id: 'dean_noc',
    title: "Dean's NOC",
    authority: "Dean's Office",
    description: "No Objection Certificate from the Dean's Office. Required for all external or inter-college events.",
    required: true,
    templateUrl: '#',
  },
  {
    id: 'principal_letter',
    title: 'Principal Approval Letter',
    authority: 'Principal',
    description: 'Formal permission letter addressed to the Principal. Required for large-scale or sponsored events.',
    required: true,
    templateUrl: '#',
  },
  {
    id: 'budget',
    title: 'Budget Approval Form',
    authority: 'Council / Finance',
    description: 'Detailed budget breakdown to be approved by the student council finance committee.',
    required: false,
    templateUrl: '#',
  },
  {
    id: 'external_speaker',
    title: 'External Speaker / Guest Form',
    authority: "Dean's Office",
    description: 'Required when inviting external guests, judges, or speakers to campus.',
    required: false,
    templateUrl: '#',
  },
  {
    id: 'media',
    title: 'Media & Photography Consent',
    authority: 'College Administration',
    description: 'Permission for photography, videography, and media coverage during the event.',
    required: false,
  },
];

type FormStatus = 'not_uploaded' | 'uploaded' | 'approved' | 'rejected';

function formStatusBadge(status: FormStatus) {
  if (status === 'uploaded')    return <span className="px-2 py-0.5 rounded text-[10px] font-fira bg-blue-500/10 text-blue-400">Uploaded</span>;
  if (status === 'approved')    return <span className="px-2 py-0.5 rounded text-[10px] font-fira bg-emerald-500/10 text-emerald-400">Approved</span>;
  if (status === 'rejected')    return <span className="px-2 py-0.5 rounded text-[10px] font-fira bg-red-500/10 text-red-400">Rejected</span>;
  return <span className="px-2 py-0.5 rounded text-[10px] font-fira bg-zinc-800 text-zinc-600">Pending Upload</span>;
}

// --- Approval chain definition -----------------------------------------------
const APPROVAL_STAGES: {
  key: string;
  label: string;
  role: string;
  icon: React.ElementType;
  description: string;
  reachedWhen: (history: string[]) => boolean;
}[] = [
  {
    key: 'DRAFT',
    label: 'Drafted',
    role: 'Event Organizer',
    icon: FileText,
    description: 'Event created and saved as a draft.',
    reachedWhen: () => true,
  },
  {
    key: 'APPLIED_FOR_APPROVAL',
    label: 'Submitted for Review',
    role: 'Council / Nodal Officer',
    icon: Send,
    description: 'Organizer submitted the event for council review.',
    reachedWhen: (h) => h.includes('APPLIED_FOR_APPROVAL'),
  },
  {
    key: 'COUNCIL_APPROVED',
    label: 'Council Clearance',
    role: "Dean's Office",
    icon: Users,
    description: "Council has reviewed and forwarded to the Dean's Office.",
    reachedWhen: (h) =>
      h.some((s) =>
        ['UNLISTED', 'UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED',
          'ONGOING', 'COMPLETED', 'TICKET_OPEN', 'TICKET_CLOSED', 'PRIVATE'].includes(s),
      ),
  },
  {
    key: 'DEAN_APPROVED',
    label: "Principal's Approval",
    role: 'Principal',
    icon: GraduationCap,
    description: "Dean has forwarded to the Principal for final sign-off.",
    reachedWhen: (h) =>
      h.some((s) =>
        ['UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED',
          'ONGOING', 'COMPLETED', 'TICKET_OPEN', 'TICKET_CLOSED'].includes(s),
      ),
  },
  {
    key: 'APPROVED',
    label: 'Approved and Live',
    role: 'System',
    icon: ShieldCheck,
    description: 'All permissions granted. Event is active.',
    reachedWhen: (h) =>
      h.some((s) =>
        ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED',
          'TICKET_OPEN', 'TICKET_CLOSED'].includes(s),
      ),
  },
];

// --- State config -------------------------------------------------------------
const STATE_META: Record<string, { label: string; cls: string; desc: string }> = {
  DRAFT:                { label: 'Draft',                cls: 'bg-zinc-700 text-zinc-300',         desc: 'Not yet submitted for approval.' },
  APPLIED_FOR_APPROVAL: { label: 'Awaiting Approval',   cls: 'bg-amber-500/15 text-amber-400',     desc: 'Pending review by the council.' },
  UNLISTED:             { label: 'Council Approved',    cls: 'bg-blue-500/15 text-blue-400',       desc: 'Cleared by council. Awaiting higher approval.' },
  UPCOMING:             { label: 'Approved - Upcoming', cls: 'bg-emerald-500/15 text-emerald-400', desc: 'All approvals granted. Event goes live soon.' },
  REGISTRATION_OPEN:    { label: 'Live',                cls: 'bg-emerald-500/15 text-emerald-400', desc: 'Fully approved. Registration is open.' },
  REGISTRATION_CLOSED:  { label: 'Reg. Closed',         cls: 'bg-zinc-600/30 text-zinc-400',       desc: 'Approvals complete. Registration period ended.' },
  ONGOING:              { label: 'Ongoing',             cls: 'bg-purple-500/15 text-purple-400',   desc: 'Event is currently in progress.' },
  COMPLETED:            { label: 'Completed',           cls: 'bg-zinc-600/30 text-zinc-400',       desc: 'Event has concluded.' },
  TICKET_OPEN:          { label: 'Tickets Open',        cls: 'bg-emerald-500/15 text-emerald-400', desc: 'Ticketing is active.' },
  TICKET_CLOSED:        { label: 'Tickets Closed',      cls: 'bg-zinc-600/30 text-zinc-400',       desc: 'Ticketing has ended.' },
  PRIVATE:              { label: 'Private',             cls: 'bg-zinc-600/30 text-zinc-400',       desc: 'Visible only to selected participants.' },
};

function getStageStatus(
  stage: (typeof APPROVAL_STAGES)[0],
  history: string[],
  currentState: string,
): 'done' | 'current' | 'pending' {
  if (stage.reachedWhen(history) || stage.reachedWhen([currentState])) return 'done';
  const lastDoneIdx = APPROVAL_STAGES.reduce(
    (acc, s, i) => (s.reachedWhen(history) || s.reachedWhen([currentState]) ? i : acc),
    -1,
  );
  const thisIdx = APPROVAL_STAGES.findIndex((s) => s.key === stage.key);
  if (thisIdx === lastDoneIdx + 1) return 'current';
  return 'pending';
}

// --- Main component -----------------------------------------------------------
export default function EventPermissions() {
  const { id } = useParams<{ id: string }>();
  const { eventsList } = useContext(EventsDataContext);
  const event = eventsList.find((e) => String(e.id) === String(id));

  if (!id) return <Navigate to="/" />;
  if (!event) {
    return (
      <div className="min-h-screen bg-[#121214] flex items-center justify-center">
        <p className="text-zinc-600 font-fira text-sm">Event not found.</p>
      </div>
    );
  }

  const history: string[] = event.state_history ?? [];
  const meta = STATE_META[event.state] ?? { label: event.state, cls: 'bg-zinc-700 text-zinc-300', desc: '' };
  const canSubmit = event.state === 'DRAFT';

  // Form upload state (local UI simulation — wire to API when ready)
  const [formStatuses, setFormStatuses] = useState<Record<string, FormStatus>>(
    () => Object.fromEntries(PERMISSION_FORMS.map((f) => [f.id, 'not_uploaded'])),
  );
  const [uploadedNames, setUploadedNames] = useState<Record<string, string>>({});

  function handleFileChange(formId: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadedNames((prev) => ({ ...prev, [formId]: files[0].name }));
    setFormStatuses((prev) => ({ ...prev, [formId]: 'uploaded' }));
  }

  function clearUpload(formId: string) {
    setUploadedNames((prev) => { const n = { ...prev }; delete n[formId]; return n; });
    setFormStatuses((prev) => ({ ...prev, [formId]: 'not_uploaded' }));
  }

  const uploadedCount = Object.values(formStatuses).filter((s) => s !== 'not_uploaded').length;
  const requiredForms = PERMISSION_FORMS.filter((f) => f.required);
  const requiredDone = requiredForms.every((f) => formStatuses[f.id] !== 'not_uploaded');

  return (
    <div className="min-h-screen bg-[#121214] px-8 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-3">
          <Link
            to={`../event-details/${id}`}
            className="w-8 h-8 mt-1 rounded-lg bg-[#1c1c1e] border border-white/[0.06] hover:border-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition-all shrink-0"
          >
            <ArrowLeft size={15} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-white font-marcellus text-2xl leading-tight">Permission Status</h1>
              <span className={"px-2.5 py-1 rounded-md text-[11px] font-fira font-semibold tracking-wide " + meta.cls}>
                {meta.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-zinc-500 text-sm font-fira">{event.name}</p>
              <span className="text-zinc-700 text-xs">·</span>
              <Link to="/approvals" className="text-zinc-600 hover:text-zinc-400 text-xs font-fira transition-colors">Approval Tracker</Link>
            </div>
          </div>
        </div>
        {canSubmit && (
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-fira rounded-xl transition-colors"
          >
            <Send size={13} /> Submit for Approval
          </button>
        )}
      </div>

      {/* Awaiting banner */}
      {event.state === 'APPLIED_FOR_APPROVAL' && (
        <div className="flex items-start gap-3 px-4 py-4 bg-amber-500/5 border border-amber-500/15 rounded-xl mb-6">
          <Clock size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 font-fira font-semibold text-sm">Awaiting Review</p>
            <p className="text-zinc-500 text-xs font-fira mt-0.5">
              Your permission request has been submitted and is currently under review. You will be notified once a decision is made.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Approval chain + state history */}
        <div className="lg:col-span-2 space-y-4">

          {/* Stage timeline */}
          <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
            <p className="text-white font-fira font-semibold text-sm mb-5">Approval Chain</p>
            <div>
              {APPROVAL_STAGES.map((stage, idx) => {
                const status = getStageStatus(stage, history, event.state);
                const Icon = stage.icon;
                const isLast = idx === APPROVAL_STAGES.length - 1;
                return (
                  <div key={stage.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors " +
                          (status === 'done'    ? 'bg-emerald-500/15 border-emerald-500/30' :
                           status === 'current' ? 'bg-amber-500/15 border-amber-500/30' :
                                                  'bg-zinc-800 border-zinc-700/50')
                        }
                      >
                        {status === 'done'    ? <CheckCircle2 size={14} className="text-emerald-400" /> :
                         status === 'current' ? <Clock size={14} className="text-amber-400" /> :
                                                <Icon size={14} className="text-zinc-600" />}
                      </div>
                      {!isLast && (
                        <div
                          className={"w-px flex-1 min-h-[28px] my-1 " + (status === 'done' ? 'bg-emerald-500/20' : 'bg-zinc-800')}
                        />
                      )}
                    </div>
                    <div className={"min-w-0 flex-1 " + (isLast ? "pb-0" : "pb-6")}>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p
                          className={
                            "text-sm font-fira font-semibold " +
                            (status === 'done' ? 'text-white' : status === 'current' ? 'text-amber-300' : 'text-zinc-600')
                          }
                        >
                          {stage.label}
                        </p>
                        <span
                          className={
                            "text-[10px] font-fira px-1.5 py-0.5 rounded " +
                            (status === 'done'    ? 'bg-emerald-500/10 text-emerald-500' :
                             status === 'current' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-zinc-800 text-zinc-600')
                          }
                        >
                          {status === 'done' ? 'Completed' : status === 'current' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-zinc-600 text-xs font-fira">{stage.role}</p>
                      <p className="text-zinc-700 text-xs font-fira mt-1 leading-relaxed">{stage.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Permission Forms */}
          <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-white font-fira font-semibold text-sm">Permission Forms</p>
              <span className="text-zinc-600 text-xs font-fira">{uploadedCount} / {PERMISSION_FORMS.length} uploaded</span>
            </div>
            <p className="text-zinc-600 text-xs font-fira mb-4">
              Download the form template, fill it out, get the required signatures, and upload the signed copy.
            </p>

            {/* Progress bar */}
            <div className="h-1 bg-zinc-800 rounded-full mb-5 overflow-hidden">
              <div
                className="h-full bg-red-600 rounded-full transition-all"
                style={{ width: PERMISSION_FORMS.length > 0 ? (uploadedCount * 100 / PERMISSION_FORMS.length) + '%' : '0%' }}
              />
            </div>

            <div className="space-y-3">
              {PERMISSION_FORMS.map((form) => {
                const status = formStatuses[form.id];
                const fileName = uploadedNames[form.id];
                return (
                  <div key={form.id} className="border border-white/[0.05] rounded-xl p-4 bg-zinc-900/40">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-start gap-2 min-w-0">
                        <FileText size={13} className="text-zinc-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white text-sm font-fira font-medium">{form.title}</p>
                            {form.required && (
                              <span className="text-[9px] font-fira text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Required</span>
                            )}
                          </div>
                          <p className="text-zinc-600 text-[10px] font-fira">{form.authority}</p>
                        </div>
                      </div>
                      {formStatusBadge(status)}
                    </div>
                    <p className="text-zinc-600 text-xs font-fira ml-5 mb-3 leading-relaxed">{form.description}</p>
                    <div className="flex items-center gap-2 ml-5 flex-wrap">
                      {form.templateUrl && (
                        <a
                          href={form.templateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-white/[0.06] text-zinc-400 hover:text-white text-xs font-fira rounded-lg transition-all"
                        >
                          <Download size={11} /> Template
                        </a>
                      )}
                      {status === 'not_uploaded' ? (
                        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-white/[0.06] text-zinc-400 hover:text-white text-xs font-fira rounded-lg transition-all cursor-pointer">
                          <Upload size={11} /> Upload Signed Copy
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => handleFileChange(form.id, e.target.files)}
                          />
                        </label>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-white/[0.06] text-zinc-400 text-xs font-fira rounded-lg">
                            <Paperclip size={11} />
                            <span className="max-w-[160px] truncate">{fileName ?? 'Uploaded file'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => clearUpload(form.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-600 hover:text-red-400 border border-white/[0.06] transition-all"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit button if all required forms uploaded */}
            {requiredDone && canSubmit && (
              <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <p className="text-emerald-400 text-xs font-fira">All required forms uploaded. Ready to submit.</p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-fira rounded-lg transition-colors"
                >
                  <Send size={11} /> Submit
                </button>
              </div>
            )}
          </div>

          {/* State history breadcrumb */}
          {history.length > 0 && (
            <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
              <p className="text-white font-fira font-semibold text-sm mb-4">State History</p>
              <div className="flex flex-wrap items-center gap-2">
                {history.map((s, i) => {
                  const m = STATE_META[s];
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className={"px-2.5 py-1 rounded-md text-[11px] font-fira " + (m ? m.cls : 'bg-zinc-800 text-zinc-500')}>
                        {m ? m.label : s}
                      </span>
                      {i < history.length - 1 && <ChevronRight size={12} className="text-zinc-700" />}
                    </div>
                  );
                })}
                {event.state !== history[history.length - 1] && (
                  <>
                    <ChevronRight size={12} className="text-zinc-700" />
                    <span className={"px-2.5 py-1 rounded-md text-[11px] font-fira " + meta.cls}>{meta.label}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Info panel */}
        <div className="space-y-4">

          {/* Current status */}
          <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
            <p className="text-zinc-600 text-[10px] font-fira uppercase tracking-wider mb-3">Current Status</p>
            <span className={"inline-block px-3 py-1.5 rounded-lg text-sm font-fira font-semibold mb-2 " + meta.cls}>
              {meta.label}
            </span>
            <p className="text-zinc-500 text-xs font-fira leading-relaxed">{meta.desc}</p>
          </div>

          {/* Authority remark */}
          {event.comment && (
            <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={13} className="text-zinc-500" />
                <p className="text-zinc-400 text-xs font-fira uppercase tracking-wider">Remark from Authority</p>
              </div>
              <p className="text-white text-sm font-fira leading-relaxed italic">"{event.comment}"</p>
            </div>
          )}

          {/* What happens next */}
          <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info size={13} className="text-zinc-500" />
              <p className="text-zinc-400 text-xs font-fira uppercase tracking-wider">What Happens Next</p>
            </div>
            <p className="text-zinc-500 text-xs font-fira leading-relaxed">
              {event.state === 'DRAFT'
                ? 'Submit your event for approval when ready. The council will review your details and forward it to the Dean and Principal.'
                : event.state === 'APPLIED_FOR_APPROVAL'
                  ? 'The council is reviewing your event. Once cleared, it will be forwarded to the Dean and Principal. This typically takes 3-5 working days.'
                  : event.state === 'UNLISTED'
                    ? "Council clearance granted. The Dean's Office and Principal will review your event next."
                    : ['UPCOMING', 'REGISTRATION_OPEN', 'ONGOING', 'COMPLETED'].includes(event.state)
                      ? 'All permissions have been granted. No further action required.'
                      : 'Contact the council office for further information.'}
            </p>
          </div>

          {/* Pre-submission checklist */}
          <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lock size={13} className="text-zinc-500" />
              <p className="text-zinc-400 text-xs font-fira uppercase tracking-wider">Submission Checklist</p>
            </div>
            <ul className="space-y-2">
              {[
                { label: 'Event description', done: !!event.description },
                { label: 'Date(s) set',        done: Array.isArray(event.dates) && event.dates.length > 0 },
                { label: 'Venue specified',     done: !!event.venue },
                { label: 'Banner uploaded',     done: !!event.banner_url },
              ].map(({ label, done }) => (
                <li key={label} className="flex items-center gap-2 text-xs font-fira">
                  {done
                    ? <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    : <AlertCircle size={12} className="text-amber-500 shrink-0" />}
                  <span className={done ? 'text-zinc-400' : 'text-amber-400'}>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Approving authorities */}
          <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
            <p className="text-zinc-600 text-[10px] font-fira uppercase tracking-wider mb-3">Approving Authorities</p>
            <div className="space-y-3">
              {([
                { label: 'Council / Nodal Officer', Icon: Users },
                { label: "Dean's Office",           Icon: Building2 },
                { label: 'Principal',               Icon: GraduationCap },
              ] as const).map(({ label, Icon }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                    <Icon size={12} className="text-zinc-500" />
                  </div>
                  <span className="text-zinc-500 text-xs font-fira">{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
