import { useContext } from 'react';
import EventsDataContext from '../contexts/EventsDataContext';
import { CheckCircle2, Circle, Clock, AlertCircle, ChevronRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

type ApprovalStage = 'COUNCIL' | 'DEAN' | 'PRINCIPAL' | 'APPROVED' | 'REJECTED';

interface ApprovalInfo {
  stage: ApprovalStage;
  submittedAt: string;
  notes?: string;
}

// Mock approval statuses keyed by event id
const MOCK_APPROVALS: Record<number, ApprovalInfo> = {
  10: { stage: 'COUNCIL', submittedAt: '2026-04-28T10:00:00', notes: 'Pending initial council review.' },
  2:  { stage: 'DEAN',    submittedAt: '2026-04-20T09:00:00', notes: 'Forwarded to Dean for approval.' },
  6:  { stage: 'PRINCIPAL', submittedAt: '2026-04-15T11:00:00', notes: 'Forwarded to Principal.' },
  1:  { stage: 'APPROVED', submittedAt: '2026-04-10T08:00:00' },
  3:  { stage: 'APPROVED', submittedAt: '2026-04-01T08:00:00' },
  5:  { stage: 'REJECTED', submittedAt: '2026-04-12T15:00:00', notes: 'Budget exceeds limit. Please revise.' },
};

const STAGES: ApprovalStage[] = ['COUNCIL', 'DEAN', 'PRINCIPAL', 'APPROVED'];

function stageIndex(s: ApprovalStage): number {
  if (s === 'REJECTED') return -1;
  return STAGES.indexOf(s);
}

function StatusBadge({ stage }: { stage: ApprovalStage }) {
  if (stage === 'APPROVED')  return <span className="text-[11px] font-fira font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Approved</span>;
  if (stage === 'REJECTED')  return <span className="text-[11px] font-fira font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">Rejected</span>;
  return <span className="text-[11px] font-fira font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">In Review</span>;
}

function StageTracker({ current }: { current: ApprovalStage }) {
  const idx = stageIndex(current);
  const rejected = current === 'REJECTED';
  return (
    <div className="flex items-center gap-0">
      {STAGES.map((s, i) => {
        const done   = !rejected && i < idx;
        const active = !rejected && i === idx;
        return (
          <div key={s} className="flex items-center">
            <div className={`flex flex-col items-center gap-1 min-w-[72px]`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                done   ? 'bg-emerald-500 border-emerald-500 text-white' :
                active ? 'bg-amber-500/20 border-amber-500 text-amber-400' :
                rejected && i <= 2 ? 'bg-red-500/10 border-red-500/30 text-red-500/50' :
                'border-zinc-700 text-zinc-700'
              }`}>
                {done   ? <CheckCircle2 size={14} /> :
                 active ? <Clock size={14} /> :
                 rejected && i <= stageIndex('PRINCIPAL') ? <AlertCircle size={14} /> :
                 <Circle size={14} />}
              </div>
              <span className={`text-[10px] font-fira text-center leading-tight ${
                done ? 'text-emerald-400' : active ? 'text-amber-400' : 'text-zinc-600'
              }`}>{s === 'APPROVED' ? 'Done' : s.charAt(0) + s.slice(1).toLowerCase()}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`w-8 h-0.5 mb-5 mx-1 rounded-full ${done ? 'bg-emerald-500/50' : 'bg-zinc-800'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ApprovalTracker() {
  const { eventsList } = useContext(EventsDataContext);
  const allEvents = Object.values(eventsList).flat();

  // Group by status
  const pending  = allEvents.filter(e => MOCK_APPROVALS[e.id] && !['APPROVED'].includes(MOCK_APPROVALS[e.id].stage));
  const approved = allEvents.filter(e => MOCK_APPROVALS[e.id]?.stage === 'APPROVED');
  const others   = allEvents.filter(e => !MOCK_APPROVALS[e.id]);

  const sections = [
    { title: 'Pending Approval', events: pending,  emptyText: 'No events pending approval.' },
    { title: 'Approved',         events: approved, emptyText: 'No approved events yet.' },
    { title: 'Not Submitted',    events: others,   emptyText: 'All events have been submitted.' },
  ];

  return (
    <div className="min-h-screen bg-[#121214] px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white font-marcellus text-2xl mb-1">Approval Tracker</h1>
        <p className="text-zinc-500 text-sm font-fira">Track the approval status of each event through council → dean → principal.</p>
      </div>

      {/* Summary badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Events', value: allEvents.length },
          { label: 'Pending', value: pending.length, color: 'text-amber-400' },
          { label: 'Approved', value: approved.length, color: 'text-emerald-400' },
          { label: 'Rejected', value: allEvents.filter(e => MOCK_APPROVALS[e.id]?.stage === 'REJECTED').length, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-4">
            <p className="text-zinc-500 text-[11px] font-fira uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-fira font-bold ${color ?? 'text-white'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      {sections.map(({ title, events, emptyText }) => (
        <div key={title} className="mb-8">
          <h2 className="text-zinc-400 text-xs font-fira uppercase tracking-widest mb-3">{title}</h2>
          {events.length === 0 ? (
            <p className="text-zinc-700 text-sm font-fira py-4">{emptyText}</p>
          ) : (
            <div className="space-y-3">
              {events.map(ev => {
                const info = MOCK_APPROVALS[ev.id];
                return (
                  <div key={ev.id} className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Link to={`/event-details/${ev.id}`}
                            className="text-white font-fira font-semibold text-sm hover:text-red-400 transition-colors">
                            {ev.name}
                          </Link>
                          {info && <StatusBadge stage={info.stage} />}
                        </div>
                        <p className="text-zinc-600 text-xs font-fira mt-0.5">
                          {new Date(ev.dates?.[0] ?? ev.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {info && <> · Submitted {new Date(info.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/event-details/${ev.id}/permissions`}
                          className="shrink-0 flex items-center gap-1.5 text-xs font-fira px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-white/[0.06] text-zinc-400 hover:text-white rounded-lg transition-all">
                          <ShieldCheck size={12} /> Approval Status
                        </Link>
                        <Link to={`/event-details/${ev.id}/edit`}
                          className="shrink-0 flex items-center gap-1 text-xs font-fira text-zinc-500 hover:text-zinc-200 transition-colors">
                          Edit <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>

                    {info ? (
                      <>
                        <StageTracker current={info.stage} />
                        {info.notes && (
                          <div className="mt-3 flex items-start gap-2 bg-zinc-900/50 border border-white/[0.04] rounded-lg px-3 py-2.5">
                            <AlertCircle size={13} className="text-zinc-500 shrink-0 mt-0.5" />
                            <p className="text-zinc-400 text-xs font-fira">{info.notes}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-zinc-600 text-xs font-fira">
                        <Circle size={13} />
                        Not yet submitted for approval
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
