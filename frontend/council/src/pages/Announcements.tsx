import { useState, useContext } from 'react';
import Select from '../components/Select';
import EventsDataContext from '../contexts/EventsDataContext';
import { Send, Megaphone, Clock, Users, Check } from 'lucide-react';

interface SentAnnouncement {
  id: number;
  eventName: string;
  subject: string;
  body: string;
  recipientCount: number;
  sentAt: string;
  channel: 'email' | 'push';
}

const MOCK_SENT: SentAnnouncement[] = [
  {
    id: 1,
    eventName: 'TechFest 2026',
    subject: 'Schedule Update – TechFest 2026',
    body: 'The schedule has been updated. Please check the event page for the latest timings.',
    recipientCount: 428,
    sentAt: '2026-04-29T10:00:00',
    channel: 'email',
  },
  {
    id: 2,
    eventName: 'HackSphere 2026',
    subject: 'Reminder: Submission Deadline Tomorrow',
    body: 'This is a reminder that project submissions close tomorrow at 11:59 PM.',
    recipientCount: 312,
    sentAt: '2026-03-14T09:30:00',
    channel: 'email',
  },
];

const TEMPLATES = [
  { label: 'Reminder',    subject: 'Reminder: {event}', body: 'This is a friendly reminder about {event} happening soon. Please check the event page for the latest updates.' },
  { label: 'Update',      subject: 'Update: {event}',   body: 'We have an update regarding {event}. Please read this message carefully.' },
  { label: 'Cancellation', subject: '{event} – Cancelled', body: 'We regret to inform you that {event} has been cancelled. We apologise for the inconvenience.' },
  { label: 'Thank You',   subject: 'Thank you for joining {event}', body: 'Thank you for participating in {event}! We hope you had a great experience. Stay tuned for more events.' },
];

export default function Announcements() {
  const { eventsList } = useContext(EventsDataContext);
  const allEvents = Object.values(eventsList).flat();

  const [selectedEventId, setSelectedEventId] = useState<number | null>(allEvents[0]?.id ?? null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [channel, setChannel] = useState<'email' | 'push'>('email');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<SentAnnouncement[]>(MOCK_SENT);

  const selectedEvent = allEvents.find(e => e.id === selectedEventId);
  const mockRecipients = 85 + ((selectedEventId ?? 0) * 37) % 300;

  function applyTemplate(t: typeof TEMPLATES[0]) {
    const name = selectedEvent?.name ?? 'the event';
    setSubject(t.subject.replace('{event}', name));
    setBody(t.body.replace('{event}', name));
  }

  function handleSend() {
    if (!subject.trim() || !body.trim() || !selectedEventId) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      const newEntry: SentAnnouncement = {
        id: Date.now(),
        eventName: selectedEvent?.name ?? '',
        subject,
        body,
        recipientCount: mockRecipients,
        sentAt: new Date().toISOString(),
        channel,
      };
      setHistory(prev => [newEntry, ...prev]);
      setSubject('');
      setBody('');
      setTimeout(() => setSent(false), 3000);
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-[#121214] px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white font-marcellus text-2xl mb-1">Announcements</h1>
        <p className="text-zinc-500 text-sm font-fira">Send emails or push notifications to all registered participants.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Compose panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Event selector */}
          <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
            <label className="text-zinc-500 text-[11px] font-fira uppercase tracking-widest block mb-2">Event</label>
            <Select
              value={selectedEventId ?? ''}
              onChange={v => setSelectedEventId(Number(v))}
              options={allEvents.map(ev => ({ value: ev.id, label: ev.name }))}
            />
            {selectedEvent && (
              <div className="mt-2 flex items-center gap-2 text-zinc-500 text-xs font-fira">
                <Users size={12} />
                <span>~{mockRecipients} registered participants will receive this</span>
              </div>
            )}
          </div>

          {/* Channel toggle */}
          <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
            <label className="text-zinc-500 text-[11px] font-fira uppercase tracking-widest block mb-3">Channel</label>
            <div className="flex gap-2">
              {(['email','push'] as const).map(c => (
                <button key={c} type="button" onClick={() => setChannel(c)}
                  className={`px-5 py-2 rounded-lg text-sm font-fira border transition-all capitalize ${
                    channel === c ? 'bg-red-600/15 border-red-600/40 text-white' : 'bg-[#252527] border-white/[0.06] text-zinc-400 hover:border-white/15'
                  }`}>
                  {c === 'email' ? '📧 Email' : '🔔 Push Notification'}
                </button>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5">
            <label className="text-zinc-500 text-[11px] font-fira uppercase tracking-widest block mb-3">Quick Templates</label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button key={t.label} type="button" onClick={() => applyTemplate(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-fira bg-zinc-800/70 text-zinc-300 hover:bg-zinc-700/70 hover:text-white border border-white/[0.05] transition-all">
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Compose */}
          <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5 space-y-4">
            <label className="text-zinc-500 text-[11px] font-fira uppercase tracking-widest block">Compose</label>
            <div>
              <label className="text-zinc-400 text-xs font-fira block mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Enter subject…"
                className="w-full bg-[#252527] border border-white/[0.06] focus:border-red-600/40 rounded-lg px-3 py-2.5 text-sm font-fira text-white placeholder-zinc-600 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs font-fira block mb-1.5">Message</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Type your message…"
                rows={5}
                className="w-full bg-[#252527] border border-white/[0.06] focus:border-red-600/40 rounded-lg px-3 py-2.5 text-sm font-fira text-white placeholder-zinc-600 outline-none transition-colors resize-none"
              />
              <p className="text-zinc-700 text-[11px] font-fira mt-1 text-right">{body.length} chars</p>
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={!subject.trim() || !body.trim() || sending || !selectedEventId}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-fira font-semibold transition-all ${
                sent ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' :
                sending ? 'bg-red-600/50 text-white/70 cursor-wait' :
                !subject.trim() || !body.trim() || !selectedEventId
                  ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {sent ? <><Check size={15} /> Sent!</> :
               sending ? <><Clock size={15} className="animate-spin" /> Sending…</> :
               <><Send size={15} /> Send to ~{mockRecipients} participants</>}
            </button>
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-2">
          <h2 className="text-zinc-400 text-xs font-fira uppercase tracking-widest mb-3">Sent History</h2>
          {history.length === 0 ? (
            <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-8 text-center">
              <Megaphone size={32} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-600 font-fira text-sm">No announcements sent yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(h => (
                <div key={h.id} className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-white text-sm font-fira font-semibold leading-tight">{h.subject}</p>
                    <span className="shrink-0 text-[10px] font-fira px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize">{h.channel}</span>
                  </div>
                  <p className="text-zinc-600 text-[11px] font-fira mb-2">{h.eventName}</p>
                  <p className="text-zinc-500 text-xs font-fira line-clamp-2 mb-2">{h.body}</p>
                  <div className="flex items-center justify-between text-[11px] font-fira text-zinc-600">
                    <span className="flex items-center gap-1"><Users size={11} />{h.recipientCount} recipients</span>
                    <span>{new Date(h.sentAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
