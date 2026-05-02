import { useContext, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, ArrowRight, Calendar, Location, People, Check, Clock,
  MessageText, InfoCircle, Ticket, Global,
  Tag, User, Send, Shield, ShieldTick, DirectSend,
} from 'iconsax-react';
import EventsDataContext from '../contexts/EventsDataContext';
import { UserDataContext } from '../contexts/userContext';

// ── State label map ───────────────────────────────────────────────────────────
const STATE_LABELS: Record<string, { label: string; cls: string }> = {
  DRAFT:                        { label: 'Draft',                cls: 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300' },
  APPLIED_FOR_APPROVAL:         { label: 'Awaiting Faculty',    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  APPLIED_FOR_PRINCI_APPROVAL:  { label: 'Awaiting Principal',  cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400' },
  UNLISTED:                     { label: 'Approved (Unlisted)', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  UPCOMING:                     { label: 'Upcoming',            cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  REGISTRATION_OPEN:            { label: 'Live',                cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  ONGOING:                      { label: 'Ongoing',             cls: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400' },
  COMPLETED:                    { label: 'Completed',           cls: 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400' },
};

// ── Approval chain ────────────────────────────────────────────────────────────
const LIVE_STATES = ['UNLISTED', 'UPCOMING', 'REGISTRATION_OPEN', 'ONGOING', 'COMPLETED'];

interface ChainStage {
  key: string;
  label: string;
  role: string;
  reachedWhen: (h: string[]) => boolean;
}

const CHAIN: ChainStage[] = [
  {
    key: 'submitted',
    label: 'Submitted for Review',
    role: 'Event Organizer',
    reachedWhen: (h) => h.some(s => s !== 'DRAFT'),
  },
  {
    key: 'faculty',
    label: 'Faculty / Council Clearance',
    role: 'Nodal Officer',
    reachedWhen: (h) => h.some(s => ['APPLIED_FOR_PRINCI_APPROVAL', ...LIVE_STATES].includes(s)),
  },
  {
    key: 'principal',
    label: "Principal's Approval",
    role: 'Principal',
    reachedWhen: (h) => h.some(s => LIVE_STATES.includes(s)),
  },
  {
    key: 'approved',
    label: 'Approved & Live',
    role: 'System',
    reachedWhen: (h) => h.some(s => ['UPCOMING', 'REGISTRATION_OPEN', 'ONGOING', 'COMPLETED'].includes(s)),
  },
];

type IconsaxIcon = React.ComponentType<{ size?: number | string; className?: string; variant?: string }>;

function stageStatus(stage: ChainStage, history: string[], currentState: string): 'done' | 'current' | 'pending' {
  const combined = [...history, currentState];
  if (stage.reachedWhen(combined)) return 'done';
  const lastDoneIdx = CHAIN.reduce(
    (acc, s, i) => (s.reachedWhen(combined) ? i : acc), -1,
  );
  const thisIdx = CHAIN.findIndex(s => s.key === stage.key);
  if (thisIdx === lastDoneIdx + 1) return 'current';
  return 'pending';
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: { icon: IconsaxIcon; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0">
      <div className="w-6 h-6 rounded-md bg-black/[0.04] dark:bg-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={12} className="text-mute" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-mute text-[11px] font-fira uppercase tracking-wider">{label}</p>
        <div className="text-foreground text-sm font-fira mt-0.5">{value}</div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EventApproval() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { eventsData, refreshEventsData } = useContext(EventsDataContext);
  const { userData } = useContext(UserDataContext);

  const [rejectComment, setRejectComment] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [busy, setBusy] = useState(false);

  // Find event across all buckets
  const event: EventData | undefined = eventsData
    ? (Object.values(eventsData) as EventData[][]).flat().find(e => String(e.id) === id)
    : undefined;

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-mute font-fira text-sm">Event not found.</p>
      </div>
    );
  }

  const history: string[] = event.state_history ?? [];
  const stateMeta = STATE_LABELS[event.state] ?? { label: event.state, cls: 'bg-zinc-200 text-zinc-600' };
  const isPrincipal = userData?.role === 'PRINCIPAL';

  const canApprove = isPrincipal
    ? event.state === 'APPLIED_FOR_PRINCI_APPROVAL'
    : event.state === 'APPLIED_FOR_APPROVAL';

  async function approve() {
    setBusy(true);
    try {
      const newState = isPrincipal ? 'UNLISTED' : 'APPLIED_FOR_PRINCI_APPROVAL';
      await axios.request({
        baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
        url: '/api/v1/event/p/update/' + event.id,
        method: 'POST',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
        data: { state: newState, comment: null },
      });
      await refreshEventsData();
      navigate('/');
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    if (!rejectComment.trim()) return;
    setBusy(true);
    try {
      await axios.request({
        baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
        url: '/api/v1/event/p/update/' + event.id,
        method: 'POST',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
        data: { state: 'DRAFT', comment: rejectComment },
      });
      await refreshEventsData();
      navigate('/');
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  const primaryDate = event.dates?.[0] ? new Date(event.dates[0]) : null;

  return (
    <div className="min-h-screen bg-background px-6 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-7 gap-4">
        <div className="flex items-start gap-3">
          <Link to="/"
            className="w-8 h-8 mt-1 rounded-lg bg-card border border-black/[0.07] dark:border-white/[0.07] hover:border-primary/40 flex items-center justify-center text-mute hover:text-foreground transition-all shrink-0">
            <ArrowLeft size={15} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <h1 className="text-foreground font-marcellus text-2xl leading-tight">{event.name}</h1>
              <span className={'px-2.5 py-1 rounded-md text-[11px] font-fira font-semibold ' + stateMeta.cls}>
                {stateMeta.label}
              </span>
            </div>
            <p className="text-mute text-xs font-fira">
              by {event.organizer.name}
              {event.organizer.email && (
                <span className="text-mute/60"> · {event.organizer.email}</span>
              )}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        {canApprove && (
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => setShowRejectBox(v => !v)} disabled={busy}
              className="px-4 py-2 rounded-lg border border-red-500/40 text-red-500 hover:bg-red-500/10 text-sm font-fira transition-all disabled:opacity-50">
              Reject
            </button>
            <button type="button" onClick={approve} disabled={busy}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-vitality text-white text-sm font-fira transition-colors disabled:opacity-50">
              {isPrincipal ? 'Approve & Go Live' : 'Forward to Principal'}
            </button>
          </div>
        )}
      </div>

      {/* Reject box */}
      {showRejectBox && canApprove && (
        <div className="mb-5 p-4 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl">
          <p className="text-red-700 dark:text-red-400 text-sm font-fira font-semibold mb-2">Reason for rejection</p>
          <textarea
            value={rejectComment}
            onChange={e => setRejectComment(e.target.value)}
            rows={3}
            placeholder="Describe why this event is being rejected…"
            className="w-full bg-white dark:bg-card border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2 text-sm font-fira text-foreground outline-none focus:border-red-400 resize-none mb-3"
          />
          <div className="flex gap-2">
            <button type="button" onClick={reject} disabled={busy || !rejectComment.trim()}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-fira rounded-lg transition-colors disabled:opacity-50">
              Confirm Rejection
            </button>
            <button type="button" onClick={() => setShowRejectBox(false)}
              className="px-4 py-1.5 bg-card border border-black/[0.07] dark:border-white/[0.07] text-mute hover:text-foreground text-xs font-fira rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Event details + approval chain ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Banner + quick facts */}
          <div className="bg-card rounded-xl border border-black/[0.07] dark:border-white/[0.06] overflow-hidden">
            {event.banner_url && (
              <img src={event.banner_url} alt={event.name}
                className="w-full max-h-52 object-cover" />
            )}
            <div className="p-5">
              <p className="text-mute text-sm font-fira leading-relaxed mb-4">{event.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {([
                  { icon: Calendar,  label: 'Date',     value: primaryDate ? primaryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                  { icon: Location,  label: 'Venue',    value: event.venue || '—' },
                  { icon: People,    label: 'Type',     value: event.registration_type === 'TEAM' ? `Team (${event.min_ppt}–${event.ma_ppt})` : 'Individual' },
                  { icon: Ticket,    label: 'Fee',      value: event.fee > 0 ? `₹${event.fee}` : 'Free' },
                ] as { icon: IconsaxIcon; label: string; value: string }[]).map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-background rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={11} className="text-primary" />
                      <p className="text-mute text-[10px] font-fira uppercase tracking-wider">{label}</p>
                    </div>
                    <p className="text-foreground text-sm font-fira font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Long description */}
          {event.long_description && (
            <div className="bg-card rounded-xl border border-black/[0.07] dark:border-white/[0.06] p-5">
              <p className="text-mute text-[10px] font-fira uppercase tracking-wider mb-2">Full Description</p>
              <p className="text-foreground text-sm font-fira leading-relaxed whitespace-pre-line">{event.long_description}</p>
            </div>
          )}

          {/* Approval chain */}
          <div className="bg-card rounded-xl border border-black/[0.07] dark:border-white/[0.06] p-5">
            <p className="text-foreground font-fira font-semibold text-sm mb-5">Approval Chain</p>
            <div>
              {CHAIN.map((stage, idx) => {
                const status = stageStatus(stage, history, event.state);
                const stageIcons: IconsaxIcon[] = [Send, People, Shield, ShieldTick];
                const StageIcon = stageIcons[idx];
                const isLast = idx === CHAIN.length - 1;
                return (
                  <div key={stage.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ' +
                        (status === 'done'    ? 'bg-emerald-500 border-emerald-500 text-white' :
                         status === 'current' ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400' :
                                               'bg-card border-black/[0.12] dark:border-white/10 text-mute')
                      }>
                        {status === 'done'    ? <Check size={14} /> :
                         status === 'current' ? <Clock size={14} /> :
                                               <StageIcon size={14} />}
                      </div>
                      {!isLast && (
                        <div className={'w-0.5 flex-1 min-h-[24px] my-1 rounded-full ' + (status === 'done' ? 'bg-emerald-400/40' : 'bg-black/[0.08] dark:bg-white/[0.07]')} />
                      )}
                    </div>
                    <div className={'min-w-0 flex-1 ' + (isLast ? 'pb-0' : 'pb-5')}>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className={
                          'text-sm font-fira font-semibold ' +
                          (status === 'done' ? 'text-foreground' : status === 'current' ? 'text-amber-600 dark:text-amber-300' : 'text-mute')
                        }>{stage.label}</p>
                        <span className={
                          'text-[10px] font-fira px-1.5 py-0.5 rounded ' +
                          (status === 'done'    ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                           status === 'current' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                                                 'bg-black/[0.05] dark:bg-white/[0.05] text-mute')
                        }>
                          {status === 'done' ? 'Done' : status === 'current' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-mute text-xs font-fira">{stage.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* State history */}
          {history.length > 0 && (
            <div className="bg-card rounded-xl border border-black/[0.07] dark:border-white/[0.06] p-5">
              <p className="text-foreground font-fira font-semibold text-sm mb-3">State History</p>
              <div className="flex flex-wrap items-center gap-2">
                {history.map((s, i) => {
                  const m = STATE_LABELS[s];
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className={'px-2.5 py-1 rounded-md text-[11px] font-fira ' + (m ? m.cls : 'bg-zinc-200 dark:bg-zinc-800 text-mute')}>
                        {m ? m.label : s}
                      </span>
                      {i < history.length - 1 && <ArrowRight size={12} className="text-mute/40" />}
                    </div>
                  );
                })}
                {event.state !== history[history.length - 1] && (
                  <>
                    <ArrowRight size={12} className="text-mute/40" />
                    <span className={'px-2.5 py-1 rounded-md text-[11px] font-fira ' + stateMeta.cls}>{stateMeta.label}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Info panel ── */}
        <div className="space-y-4">

          {/* Organizer */}
          <div className="bg-card rounded-xl border border-black/[0.07] dark:border-white/[0.06] p-5">
            <p className="text-mute text-[10px] font-fira uppercase tracking-wider mb-3">Organizer</p>
            <div className="flex items-center gap-3">
              {event.organizer.photo_url
                ? <img src={event.organizer.photo_url} alt={event.organizer.name} className="w-10 h-10 rounded-full object-cover" />
                : <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center"><User size={16} className="text-mute" /></div>
              }
              <div>
                <p className="text-foreground text-sm font-fira font-semibold">{event.organizer.name}</p>
                <p className="text-mute text-xs font-fira">{event.organizer.email}</p>
              </div>
            </div>
          </div>

          {/* Event details */}
          <div className="bg-card rounded-xl border border-black/[0.07] dark:border-white/[0.06] p-5">
            <p className="text-mute text-[10px] font-fira uppercase tracking-wider mb-1">Event Details</p>
            <InfoRow icon={Tag} label="Type" value={event.event_type} />
            <InfoRow icon={Global} label="Audience" value={event.is_only_somaiya ? 'Somaiya Students Only' : 'Open to All'} />
            <InfoRow icon={People} label="Registration" value={event.registration_type === 'TEAM' ? `Team (${event.min_ppt}–${event.ma_ppt} members)` : 'Individual'} />
            <InfoRow icon={Ticket} label="Fee" value={event.fee > 0 ? `₹${event.fee}` : 'Free'} />
            {event.is_ticket_feature_enabled && (
              <InfoRow icon={Ticket} label="Seats" value={`${event.ticket_count} total`} />
            )}
            {event.external_registration_link && (
              <InfoRow icon={Global} label="External Link"
                value={<a href={event.external_registration_link} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs break-all">{event.external_registration_link}</a>} />
            )}
            {event.tags?.length > 0 && (
              <InfoRow icon={Tag} label="Tags" value={
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {event.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-background rounded text-[11px] font-fira text-mute">{t}</span>
                  ))}
                </div>
              } />
            )}
          </div>

          {/* Authority remark */}
          {event.comment && (
            <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageText size={13} className="text-amber-600 dark:text-amber-400" />
                <p className="text-amber-700 dark:text-amber-400 text-xs font-fira uppercase tracking-wider">Previous Remark</p>
              </div>
              <p className="text-foreground text-sm font-fira italic leading-relaxed">"{event.comment}"</p>
            </div>
          )}

          {/* What this approval means */}
          {canApprove && (
            <div className="bg-card rounded-xl border border-black/[0.07] dark:border-white/[0.06] p-5">
              <div className="flex items-center gap-2 mb-3">
                <InfoCircle size={13} className="text-mute" />
                <p className="text-mute text-[10px] font-fira uppercase tracking-wider">Your Action</p>
              </div>
              {isPrincipal ? (
                <>
                  <p className="text-foreground text-xs font-fira font-semibold mb-1">Final Approval</p>
                  <p className="text-mute text-xs font-fira leading-relaxed">
                    Approving will mark this event as <strong className="text-foreground">Unlisted</strong> and allow the council to make it live. Rejecting will send it back to the organizer as a Draft with your comment.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-foreground text-xs font-fira font-semibold mb-1">Faculty / Council Review</p>
                  <p className="text-mute text-xs font-fira leading-relaxed">
                    Forwarding will escalate this event to <strong className="text-foreground">Principal for final approval</strong>. Rejecting will return it to the organizer as a Draft.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Approving authorities reminder */}
          <div className="bg-card rounded-xl border border-black/[0.07] dark:border-white/[0.06] p-5">
            <p className="text-mute text-[10px] font-fira uppercase tracking-wider mb-3">Approval Chain</p>
            <div className="space-y-2.5">
              {([
                { label: 'Council / Nodal Officer', icon: People,     done: CHAIN[1].reachedWhen([...history, event.state]) },
                { label: 'Principal',               icon: DirectSend, done: CHAIN[2].reachedWhen([...history, event.state]) },
                { label: 'Final Approval',          icon: ShieldTick, done: CHAIN[3].reachedWhen([...history, event.state]) },
              ] as { label: string; icon: IconsaxIcon; done: boolean }[]).map(({ label, icon: Icon, done }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className={'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ' + (done ? 'bg-emerald-100 dark:bg-emerald-500/15' : 'bg-background')}>
                    <Icon size={12} className={done ? 'text-emerald-600 dark:text-emerald-400' : 'text-mute'} />
                  </div>
                  <span className={'text-xs font-fira flex-1 ' + (done ? 'text-foreground' : 'text-mute')}>{label}</span>
                  {done && <Check size={12} className="text-emerald-500" />}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
