import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Users, ExternalLink, Share2, Edit,
  Clock, Ticket, Eye, Building2, FileText, Link2, ChevronRight,
  CalendarPlus, Send, CheckCircle2, Info, Globe, Tag, ShieldCheck,
} from 'lucide-react';
import Loader from '../components/Loader';
import UserDataContext from '../contexts/UserDataContext';
import EventsDataContext from '../contexts/EventsDataContext';
import Stats from '../components/Stats';

const STATE_CONFIG: Record<string, { label: string; cls: string }> = {
  DRAFT:                { label: 'Draft',            cls: 'bg-zinc-800 text-zinc-400' },
  APPLIED_FOR_APPROVAL: { label: 'Pending Approval', cls: 'bg-amber-500/10 text-amber-400' },
  UNLISTED:             { label: 'Unlisted',          cls: 'bg-zinc-700/60 text-zinc-300' },
  UPCOMING:             { label: 'Upcoming',          cls: 'bg-blue-500/10 text-blue-400' },
  REGISTRATION_OPEN:    { label: 'Reg. Open',         cls: 'bg-emerald-500/10 text-emerald-400' },
  ONGOING:              { label: 'Ongoing',           cls: 'bg-purple-500/10 text-purple-400' },
  COMPLETED:            { label: 'Completed',         cls: 'bg-zinc-700/60 text-zinc-300' },
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0">
      <div className="w-7 h-7 rounded-lg bg-zinc-800/80 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={12} className="text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-zinc-600 text-[10px] font-fira uppercase tracking-wider mb-0.5">{label}</p>
        <div className="text-white text-sm font-fira break-words">{value}</div>
      </div>
    </div>
  );
}

export default function EventDetails() {
  const [event, setEvent] = useState<EventData | null>(null);
  const { userData } = useContext(UserDataContext);
  const { eventsList } = useContext(EventsDataContext);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async (id: string) => {
      try {
        const res = await axios.request({
          baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
          url: '/api/v1' + `/event/p/get/${id}`,
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
          },
        });
        setEvent(res.data.event);
      } catch {
        // fallback: look up in local mock/context data
        const found = eventsList.find(e => String(e.id) === String(id));
        if (found) setEvent(found);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent(id);
  }, [id, navigate, eventsList]);

  if (!id) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return <Loader />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#121214] flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400 font-fira text-lg">Event not found.</p>
        <Link to="/" className="text-red-500 font-fira text-sm hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const isOrganizer = event.organizer_id === userData?.id && !!userData?.id;
  const stateConf = STATE_CONFIG[event.state] ?? { label: event.state, cls: 'bg-zinc-800 text-zinc-400' };
  const primaryDate = event.dates?.[0] ? new Date(event.dates[0]) : null;
  const ticketPct = event.ticket_count > 0
    ? Math.round((event.tickets_sold * 100) / event.ticket_count)
    : 0;
  const remainingSeats = event.ticket_count - event.tickets_sold;

  return (
    <div className="min-h-screen bg-[#121214] px-8 py-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-7">
        <div className="flex items-start gap-3">
          <Link to=".."
            className="w-8 h-8 mt-1 rounded-lg bg-[#1c1c1e] border border-white/[0.06] hover:border-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition-all shrink-0">
            <ArrowLeft size={15} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-fira uppercase tracking-widest px-2 py-0.5 rounded-md ${stateConf.cls}`}>
                {stateConf.label}
              </span>
              <span className="text-[10px] font-fira uppercase tracking-widest px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                {event.event_type}
              </span>
            </div>
            <h1 className="text-white font-marcellus text-2xl leading-tight">{event.name}</h1>
            <p className="text-zinc-500 text-sm font-fira mt-0.5">{event.tag_line}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button"
            onClick={() => navigator.share?.({ title: event.name, url: window.location.href, text: event.description })}
            className="w-8 h-8 rounded-lg bg-[#1c1c1e] border border-white/[0.06] hover:border-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition-all">
            <Share2 size={14} />
          </button>
          {isOrganizer && (
            <Link to="./permissions"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1c1c1e] border border-white/[0.06] hover:border-white/15 text-zinc-400 hover:text-white text-xs font-fira rounded-lg transition-all">
              <ShieldCheck size={13} /> Permissions
            </Link>
          )}
          {isOrganizer && (
            <Link to="./edit"
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-fira rounded-lg transition-colors">
              <Edit size={13} /> Edit Event
            </Link>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT col (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Hero image + quick facts */}
          <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl overflow-hidden">
            {event.event_page_image_url && (
              <img src={event.event_page_image_url} alt={event.name}
                className="w-full h-56 object-cover" />
            )}
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Calendar, label: 'Date', value: primaryDate ? primaryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                { icon: Clock, label: 'Time', value: primaryDate ? primaryDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—' },
                { icon: MapPin, label: 'Venue', value: event.venue || 'TBD' },
                { icon: Users, label: 'Capacity', value: event.ticket_count > 0 ? `${event.ticket_count} seats` : 'Unlimited' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-zinc-600 text-[10px] font-fira uppercase tracking-wider">{label}</p>
                    <p className="text-white text-sm font-fira font-medium mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          {event.long_description && (
            <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
              <h2 className="text-white font-fira font-semibold text-sm mb-3 flex items-center gap-2">
                <FileText size={13} className="text-zinc-500" /> About the Event
              </h2>
              <p className="text-zinc-400 text-sm font-fira leading-relaxed whitespace-pre-line">{event.long_description}</p>
            </div>
          )}

          {/* Schedule (multiple dates) */}
          {event.dates.length > 1 && (
            <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
              <h2 className="text-white font-fira font-semibold text-sm mb-3 flex items-center gap-2">
                <Calendar size={13} className="text-zinc-500" /> Schedule
              </h2>
              <div className="space-y-0">
                {event.dates.map((d, i) => {
                  const dt = new Date(d);
                  return (
                    <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                      <span className="w-5 h-5 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-400 text-[10px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-white text-sm font-fira">
                        {dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-zinc-500 text-xs font-fira ml-auto">
                        {dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* In-event activity */}
          {event.start_in_event_activity && event.in_event_activity && (
            <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
              <h2 className="text-white font-fira font-semibold text-sm mb-3 flex items-center gap-2">
                <Link2 size={13} className="text-zinc-500" /> In-Event Activity
              </h2>
              <a href={event.in_event_activity} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-fira transition-colors break-all">
                <ExternalLink size={12} />{event.in_event_activity}
              </a>
            </div>
          )}

          {/* Additional links */}
          {event.urls && Object.keys(event.urls).length > 0 && (
            <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
              <h2 className="text-white font-fira font-semibold text-sm mb-3 flex items-center gap-2">
                <Globe size={13} className="text-zinc-500" /> Links & Resources
              </h2>
              <div className="space-y-2">
                {Object.entries(event.urls).map(([name, url]) => (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors group">
                    <span className="text-zinc-300 text-sm font-fira group-hover:text-white transition-colors">{name}</span>
                    <ExternalLink size={12} className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* State history */}
          {event.state_history && event.state_history.length > 0 && (
            <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
              <h2 className="text-white font-fira font-semibold text-sm mb-4 flex items-center gap-2">
                <Clock size={13} className="text-zinc-500" /> State History
              </h2>
              <div className="flex flex-wrap items-center gap-1">
                {event.state_history.map((s, i) => {
                  const conf = STATE_CONFIG[s] ?? { label: s, cls: 'bg-zinc-800 text-zinc-400' };
                  const isLast = i === event.state_history.length - 1;
                  return (
                    <React.Fragment key={i}>
                      <span className={`text-[10px] font-fira px-2 py-1 rounded-md ${conf.cls}`}>{conf.label}</span>
                      {!isLast && <ChevronRight size={11} className="text-zinc-700 shrink-0" />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Student-facing preview */}
          <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
            <h2 className="text-white font-fira font-semibold text-sm mb-1 flex items-center gap-2">
              <Eye size={13} className="text-zinc-500" /> Student View Preview
            </h2>
            <p className="text-zinc-600 text-xs font-fira mb-5">How this event appears to students on the student portal.</p>
            <div className="bg-[#252527] rounded-xl overflow-hidden border border-white/[0.04] max-w-xs">
              {event.event_page_image_url && (
                <img src={event.event_page_image_url} alt={event.name} className="w-full h-32 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[9px] font-fira uppercase tracking-widest px-1.5 py-0.5 rounded bg-zinc-700/80 text-zinc-400">
                    {event.event_type}
                  </span>
                  {event.state === 'REGISTRATION_OPEN' && (
                    <span className="text-[9px] font-fira uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Open</span>
                  )}
                  {event.is_only_somaiya && (
                    <span className="text-[9px] font-fira uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Somaiya</span>
                  )}
                </div>
                <h3 className="text-white font-fira font-semibold text-sm leading-snug mb-1">{event.name}</h3>
                <p className="text-zinc-500 text-[11px] font-fira mb-3 line-clamp-2">{event.description}</p>
                <div className="flex items-center gap-3 text-zinc-600 text-[10px] font-fira mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={9} />
                    {primaryDate ? primaryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={9} />{event.venue || 'TBD'}
                  </span>
                  {event.fee > 0 && (
                    <span className="text-amber-500">₹{event.fee}</span>
                  )}
                </div>
                {event.is_ticket_feature_enabled && event.ticket_count > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] font-fira text-zinc-600 mb-1">
                      <span>{event.tickets_sold} registered</span>
                      <span>{remainingSeats} left</span>
                    </div>
                    <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 rounded-full" style={{ width: `${ticketPct}%` }} />
                    </div>
                  </div>
                )}
                <div className={`w-full py-1.5 rounded-lg text-center text-[11px] font-fira font-semibold ${
                  event.state === 'REGISTRATION_OPEN' ? 'bg-red-600 text-white' :
                  event.state === 'UPCOMING'          ? 'bg-zinc-700 text-zinc-300' :
                  event.state === 'ONGOING'           ? 'bg-purple-600/20 text-purple-300' :
                  'bg-zinc-800 text-zinc-500'
                }`}>
                  {event.state === 'REGISTRATION_OPEN' ? 'Register Now' :
                   event.state === 'UPCOMING'          ? 'Coming Soon' :
                   event.state === 'ONGOING'           ? 'In Progress' :
                   event.state === 'COMPLETED'         ? 'Ended' : 'View Details'}
                </div>
              </div>
            </div>
          </div>

        </div>{/* end LEFT */}

        {/* ── RIGHT col (1/3) ── */}
        <div className="space-y-4">

          {/* Organizer */}
          <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
            <p className="text-zinc-600 text-[10px] font-fira uppercase tracking-wider mb-3">Organizer</p>
            <div className="flex items-center gap-3">
              {event.organizer?.photo_url ? (
                <img src={event.organizer.photo_url} alt={event.organizer.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/[0.08] shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-400 font-bold font-fira shrink-0">
                  {event.organizer?.name?.[0] ?? '?'}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-sm font-fira font-semibold truncate">{event.organizer?.name}</p>
                <p className="text-zinc-500 text-xs font-fira truncate">{event.organizer?.email}</p>
              </div>
            </div>
          </div>

          {/* Registration & Permissions */}
          <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
            <p className="text-zinc-600 text-[10px] font-fira uppercase tracking-wider mb-0.5">Registration &amp; Permissions</p>
            <p className="text-zinc-700 text-[10px] font-fira mb-2">Controls who can register and how.</p>
            <div>
              <InfoRow icon={Users} label="Registration Type" value={
                event.registration_type === 'INDIVIDUAL' ? 'Individual' :
                event.registration_type === 'TEAM'
                  ? `Team · ${event.min_ppt}–${event.ma_ppt} members`
                  : event.registration_type
              } />
              <InfoRow icon={Building2} label="Visibility" value={
                event.is_only_somaiya ? 'Somaiya Students Only' : 'Open to All'
              } />
              <InfoRow icon={Tag} label="Entry Fee" value={event.fee > 0 ? `₹${event.fee}` : 'Free'} />
              <InfoRow icon={Ticket} label="Ticket Feature" value={
                <span className={event.is_ticket_feature_enabled ? 'text-emerald-400' : 'text-zinc-500'}>
                  {event.is_ticket_feature_enabled ? 'Enabled' : 'Disabled'}
                </span>
              } />
              <InfoRow icon={CheckCircle2} label="Feedback" value={
                <span className={event.is_feedback_enabled ? 'text-emerald-400' : 'text-zinc-500'}>
                  {event.is_feedback_enabled ? 'Enabled after event' : 'Disabled'}
                </span>
              } />
              {event.attendance_type && (
                <InfoRow icon={Users} label="Attendance Mode" value={event.attendance_type} />
              )}
              {event.external_registration_link && (
                <InfoRow icon={ExternalLink} label="External Registration" value={
                  <a href={event.external_registration_link} target="_blank" rel="noopener noreferrer"
                    className="text-blue-400 hover:underline break-all text-xs">
                    {event.external_registration_link}
                  </a>
                } />
              )}
              {event.online_event_link && (
                <InfoRow icon={Globe} label="Online Link" value={
                  <a href={event.online_event_link} target="_blank" rel="noopener noreferrer"
                    className="text-blue-400 hover:underline break-all text-xs">
                    {event.online_event_link}
                  </a>
                } />
              )}
            </div>
          </div>

          {/* Ticket progress */}
          {event.is_ticket_feature_enabled && event.ticket_count > 0 && (
            <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-zinc-600 text-[10px] font-fira uppercase tracking-wider">Tickets Sold</p>
                <span className="text-white text-sm font-fira font-bold">
                  {event.tickets_sold}
                  <span className="text-zinc-600 font-normal"> / {event.ticket_count}</span>
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-red-600 rounded-full" style={{ width: `${ticketPct}%` }} />
              </div>
              <p className="text-zinc-600 text-xs font-fira">
                {ticketPct}% sold &middot; {remainingSeats} remaining
              </p>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
              <p className="text-zinc-600 text-[10px] font-fira uppercase tracking-wider mb-3">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map(t => (
                  <span key={t} className="px-2.5 py-1 bg-zinc-800 text-zinc-300 text-xs font-fira rounded-lg">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Internal note */}
          {event.comment && (
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-5">
              <p className="text-amber-400 text-[10px] font-fira uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Info size={11} /> Internal Note
              </p>
              <p className="text-zinc-400 text-xs font-fira leading-relaxed">{event.comment}</p>
            </div>
          )}

          {/* Branch distribution */}
          <Stats eventId={id!} />

          {/* Event report */}
          {event.report_url && (
            <a href={event.report_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 bg-[#1c1c1e] border border-white/[0.06] hover:border-white/15 rounded-xl text-zinc-400 hover:text-white text-sm font-fira transition-all group">
              <FileText size={13} className="text-zinc-600 group-hover:text-zinc-300" />
              <span>View Event Report</span>
              <ExternalLink size={11} className="ml-auto text-zinc-700 group-hover:text-zinc-400" />
            </a>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button type="button"
              onClick={() => navigator.share?.({ title: event.name, url: window.location.href, text: event.description })}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1c1c1e] border border-white/[0.06] hover:border-white/15 rounded-xl text-zinc-400 hover:text-white text-xs font-fira transition-all">
              <Send size={12} /> Share
            </button>
            <button type="button"
              onClick={() => {
                const date = primaryDate ?? new Date();
                const start = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&details=${encodeURIComponent(event.description)}&dates=${start}/${start}&ctz=Asia%2FKolkata`;
                window.open(url, '_blank');
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1c1c1e] border border-white/[0.06] hover:border-white/15 rounded-xl text-zinc-400 hover:text-white text-xs font-fira transition-all">
              <CalendarPlus size={12} /> Calendar
            </button>
          </div>

        </div>{/* end RIGHT */}
      </div>
    </div>
  );
}
