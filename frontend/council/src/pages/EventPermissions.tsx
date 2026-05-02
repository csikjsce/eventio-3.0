import { useState, useContext, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  ArrowLeft, Users, Building2, Tag, Ticket, CheckCircle2, Globe,
  ExternalLink, Eye, EyeOff, ShieldCheck, Link2, Save, RotateCcw,
  Info, UserCheck, UserX, Lock, Unlock, ChevronDown,
} from 'lucide-react';
import EventsDataContext from '../contexts/EventsDataContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface PermissionSettings {
  is_only_somaiya: boolean;
  registration_type: string;
  min_ppt: number;
  ma_ppt: number;
  fee: number;
  is_ticket_feature_enabled: boolean;
  ticket_count: number;
  is_feedback_enabled: boolean;
  attendance_type: string;
  external_registration_link: string;
  online_event_link: string;
}

// ── Small reusable UI pieces ───────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 mb-2 border-b border-white/[0.05]">
      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-zinc-400" />
      </div>
      <div>
        <p className="text-white font-fira font-semibold text-sm">{title}</p>
        <p className="text-zinc-600 text-xs font-fira mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
        checked ? 'bg-red-600' : 'bg-zinc-700'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0.5'
      }`} />
    </button>
  );
}

function PermRow({
  label, description, children,
}: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-white/[0.04] last:border-0">
      <div className="min-w-0">
        <p className="text-white text-sm font-fira">{label}</p>
        {description && <p className="text-zinc-600 text-xs font-fira mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function NativeSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-[#252527] border border-white/[0.08] focus:border-red-600/40 text-white text-sm font-fira rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
    </div>
  );
}

function NumberInput({ value, onChange, min, max, prefix }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; prefix?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {prefix && <span className="text-zinc-400 text-sm font-fira">{prefix}</span>}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(Number(e.target.value))}
        className="w-20 bg-[#252527] border border-white/[0.08] focus:border-red-600/40 text-white text-sm font-fira rounded-lg px-3 py-1.5 outline-none text-right"
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function EventPermissions() {
  const { id } = useParams<{ id: string }>();
  const { eventsList } = useContext(EventsDataContext);
  const event = eventsList.find(e => String(e.id) === String(id));

  const [settings, setSettings] = useState<PermissionSettings | null>(null);
  const [original, setOriginal] = useState<PermissionSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!event) return;
    const init: PermissionSettings = {
      is_only_somaiya: event.is_only_somaiya,
      registration_type: event.registration_type,
      min_ppt: event.min_ppt,
      ma_ppt: event.ma_ppt,
      fee: event.fee,
      is_ticket_feature_enabled: event.is_ticket_feature_enabled,
      ticket_count: event.ticket_count,
      is_feedback_enabled: event.is_feedback_enabled,
      attendance_type: event.attendance_type ?? 'MANUAL',
      external_registration_link: event.external_registration_link ?? '',
      online_event_link: event.online_event_link ?? '',
    };
    setSettings(init);
    setOriginal(init);
  }, [event?.id]);

  if (!id) return <Navigate to="/" />;
  if (!event || !settings || !original) {
    return (
      <div className="min-h-screen bg-[#121214] flex items-center justify-center">
        <p className="text-zinc-600 font-fira text-sm">Event not found.</p>
      </div>
    );
  }

  function set<K extends keyof PermissionSettings>(key: K, value: PermissionSettings[K]) {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);
    setSaved(false);
  }

  function reset() {
    setSettings(original);
    setSaved(false);
  }

  function save() {
    // TODO: PATCH to API when backend is ready
    setOriginal(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const isDirty = JSON.stringify(settings) !== JSON.stringify(original);
  const isTeam = settings.registration_type === 'TEAM';

  return (
    <div className="min-h-screen bg-[#121214] px-8 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div className="flex items-start gap-3">
          <Link to={`../event-details/${id}`}
            className="w-8 h-8 mt-1 rounded-lg bg-[#1c1c1e] border border-white/[0.06] hover:border-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition-all shrink-0">
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="text-white font-marcellus text-2xl leading-tight">Event Permissions</h1>
            <p className="text-zinc-500 text-sm font-fira mt-0.5">{event.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button type="button" onClick={reset}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1c1c1e] border border-white/[0.06] hover:border-white/15 text-zinc-400 hover:text-white text-xs font-fira rounded-lg transition-all">
              <RotateCcw size={12} /> Reset
            </button>
          )}
          <button type="button" onClick={save}
            disabled={!isDirty}
            className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-fira rounded-lg transition-all ${
              saved
                ? 'bg-emerald-600/20 border-emerald-600/30 text-emerald-400'
                : isDirty
                  ? 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                  : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-600 cursor-not-allowed'
            }`}>
            <Save size={12} /> {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Info banner */}
      {isDirty && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/5 border border-amber-500/15 rounded-xl mb-5 text-amber-400 text-xs font-fira">
          <Info size={13} className="shrink-0" />
          You have unsaved changes. Save before leaving this page.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── 1. Visibility & Access ── */}
        <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
          <SectionHeader icon={ShieldCheck} title="Visibility & Access"
            description="Control who can see and participate in this event." />
          <div>
            <PermRow label="Somaiya Students Only"
              description="When enabled, only students with a Somaiya email can register.">
              <Toggle checked={settings.is_only_somaiya} onChange={v => set('is_only_somaiya', v)} />
            </PermRow>
            <PermRow label="Visibility">
              <div className="flex items-center gap-2 text-sm font-fira">
                {settings.is_only_somaiya
                  ? <><Lock size={13} className="text-amber-400" /><span className="text-amber-400">Somaiya Only</span></>
                  : <><Unlock size={13} className="text-emerald-400" /><span className="text-emerald-400">Open to All</span></>
                }
              </div>
            </PermRow>
            {event.external_registration_link !== null && (
              <PermRow label="External Registration Link"
                description="Redirect students to an external form instead of in-app registration.">
                <div />
              </PermRow>
            )}
            <div className="pt-1">
              <label className="text-zinc-600 text-[10px] font-fira uppercase tracking-wider block mb-1.5">
                External Registration URL
              </label>
              <input
                type="url"
                value={settings.external_registration_link}
                onChange={e => set('external_registration_link', e.target.value)}
                placeholder="https://forms.google.com/…"
                className="w-full bg-[#252527] border border-white/[0.08] focus:border-red-600/40 text-white text-sm font-fira rounded-lg px-3 py-2 outline-none transition-colors placeholder-zinc-700"
              />
            </div>
            <div className="pt-3">
              <label className="text-zinc-600 text-[10px] font-fira uppercase tracking-wider block mb-1.5">
                Online Event Link
              </label>
              <input
                type="url"
                value={settings.online_event_link}
                onChange={e => set('online_event_link', e.target.value)}
                placeholder="https://meet.google.com/…"
                className="w-full bg-[#252527] border border-white/[0.08] focus:border-red-600/40 text-white text-sm font-fira rounded-lg px-3 py-2 outline-none transition-colors placeholder-zinc-700"
              />
            </div>
          </div>
        </div>

        {/* ── 2. Registration Rules ── */}
        <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
          <SectionHeader icon={Users} title="Registration Rules"
            description="Define how students register — individually or in teams." />
          <div>
            <PermRow label="Registration Type">
              <NativeSelect
                value={settings.registration_type}
                onChange={v => set('registration_type', v)}
                options={[
                  { value: 'INDIVIDUAL', label: 'Individual' },
                  { value: 'TEAM', label: 'Team' },
                ]}
              />
            </PermRow>
            {isTeam && (
              <>
                <PermRow label="Min team size"
                  description="Minimum number of members per team.">
                  <NumberInput value={settings.min_ppt} onChange={v => set('min_ppt', v)} min={2} max={settings.ma_ppt} />
                </PermRow>
                <PermRow label="Max team size"
                  description="Maximum number of members per team.">
                  <NumberInput value={settings.ma_ppt} onChange={v => set('ma_ppt', v)} min={settings.min_ppt} max={50} />
                </PermRow>
              </>
            )}
            <PermRow label="Entry Fee" description="Set to 0 for a free event.">
              <NumberInput value={settings.fee} onChange={v => set('fee', v)} min={0} prefix="₹" />
            </PermRow>
          </div>

          {/* Preview badge */}
          <div className="mt-4 p-3 bg-zinc-800/40 rounded-lg border border-white/[0.04]">
            <p className="text-zinc-600 text-[10px] font-fira uppercase tracking-wider mb-2">Student sees</p>
            <div className="flex flex-wrap gap-2">
              {settings.fee > 0
                ? <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs font-fira rounded-md">₹{settings.fee}</span>
                : <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-fira rounded-md">Free</span>
              }
              <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs font-fira rounded-md">
                {isTeam ? `Team · ${settings.min_ppt}–${settings.ma_ppt} members` : 'Individual'}
              </span>
              {settings.is_only_somaiya
                ? <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-fira rounded-md flex items-center gap-1"><Building2 size={10} /> Somaiya Only</span>
                : <span className="px-2 py-1 bg-zinc-700/60 text-zinc-400 text-xs font-fira rounded-md flex items-center gap-1"><Globe size={10} /> Open to All</span>
              }
              {settings.external_registration_link && (
                <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs font-fira rounded-md flex items-center gap-1"><ExternalLink size={10} /> External Form</span>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. Features ── */}
        <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
          <SectionHeader icon={CheckCircle2} title="Features"
            description="Enable or disable optional event features." />
          <div>
            <PermRow label="Ticketing"
              description="Manage seat capacity and issue numbered tickets to registrants.">
              <Toggle checked={settings.is_ticket_feature_enabled} onChange={v => set('is_ticket_feature_enabled', v)} />
            </PermRow>
            {settings.is_ticket_feature_enabled && (
              <PermRow label="Total Seats" description="Set to 0 for unlimited.">
                <NumberInput value={settings.ticket_count} onChange={v => set('ticket_count', v)} min={0} />
              </PermRow>
            )}
            <PermRow label="Post-Event Feedback"
              description="Students can submit feedback after the event ends.">
              <Toggle checked={settings.is_feedback_enabled} onChange={v => set('is_feedback_enabled', v)} />
            </PermRow>
            <PermRow label="Attendance Mode"
              description="How attendance will be marked for this event.">
              <NativeSelect
                value={settings.attendance_type}
                onChange={v => set('attendance_type', v)}
                options={[
                  { value: 'MANUAL', label: 'Manual' },
                  { value: 'QR', label: 'QR Scan' },
                  { value: 'AUTO', label: 'Automatic' },
                ]}
              />
            </PermRow>
          </div>

          {/* Feature summary */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Tickets', on: settings.is_ticket_feature_enabled, detail: settings.is_ticket_feature_enabled ? (settings.ticket_count > 0 ? `${settings.ticket_count} seats` : 'Unlimited') : 'Off' },
              { label: 'Feedback', on: settings.is_feedback_enabled, detail: settings.is_feedback_enabled ? 'Post-event' : 'Off' },
              { label: 'Attendance', on: true, detail: settings.attendance_type },
            ].map(({ label, on, detail }) => (
              <div key={label} className={`p-3 rounded-lg border text-center ${on ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-zinc-700/50 bg-zinc-800/30'}`}>
                <p className={`text-[10px] font-fira uppercase tracking-wider mb-1 ${on ? 'text-emerald-500' : 'text-zinc-600'}`}>{label}</p>
                <p className="text-white text-xs font-fira font-semibold">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Who Can See What ── */}
        <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
          <SectionHeader icon={Eye} title="Visibility Matrix"
            description="What different user roles can see and do with this event." />
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-fira">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-2 text-zinc-600 font-normal uppercase tracking-wider text-[10px]">Permission</th>
                  <th className="text-center py-2 text-zinc-500 font-semibold px-2">Organizer</th>
                  <th className="text-center py-2 text-zinc-500 font-semibold px-2">Council</th>
                  <th className="text-center py-2 text-zinc-500 font-semibold px-2">Student</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { action: 'View event',         organizer: true,  council: true,  student: event.state !== 'DRAFT' },
                  { action: 'Register',           organizer: false, council: false, student: event.state === 'REGISTRATION_OPEN' },
                  { action: 'Edit details',       organizer: true,  council: true,  student: false },
                  { action: 'Change state',       organizer: false, council: true,  student: false },
                  { action: 'View participants',  organizer: true,  council: true,  student: false },
                  { action: 'Mark attendance',    organizer: true,  council: true,  student: false },
                  { action: 'Submit feedback',    organizer: false, council: false, student: settings.is_feedback_enabled && event.state === 'COMPLETED' },
                  { action: 'Download report',    organizer: true,  council: true,  student: false },
                ].map(({ action, organizer, council, student }) => (
                  <tr key={action} className="border-b border-white/[0.03] last:border-0">
                    <td className="py-2.5 text-zinc-400">{action}</td>
                    {[organizer, council, student].map((v, i) => (
                      <td key={i} className="py-2.5 text-center px-2">
                        {v
                          ? <UserCheck size={13} className="text-emerald-400 mx-auto" />
                          : <UserX size={13} className="text-zinc-700 mx-auto" />
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-zinc-700 text-[10px] font-fira mt-3 leading-relaxed">
            * Visibility is derived from the current event state and the settings above. Some rows update live as you change settings.
          </p>
        </div>

      </div>
    </div>
  );
}
