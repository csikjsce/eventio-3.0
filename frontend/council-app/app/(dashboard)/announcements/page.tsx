"use client";
import { useState } from "react";
import { MOCK_EVENTS, MOCK_ANNOUNCEMENTS, ANNOUNCEMENT_TEMPLATES, type Announcement } from "@/lib/dummy-data";
import { Megaphone, Plus, X, Send, Mail, Bell, BellRing, ChevronDown, Users, CalendarDays, CheckCircle2, Lightbulb } from "lucide-react";

const CHANNEL_OPTIONS = [
  { value: "EMAIL", label: "Email only",     icon: <Mail     size={14} /> },
  { value: "PUSH",  label: "Push only",      icon: <Bell     size={14} /> },
  { value: "BOTH",  label: "Email + Push",   icon: <BellRing size={14} /> },
] as const;

type Channel = "EMAIL" | "PUSH" | "BOTH";

const INPUT = "bg-surface2 border border-border-c focus:border-red-500/40 rounded-lg px-3 py-2 text-sm font-fira text-tx placeholder-subtle-tx outline-none transition-colors w-full";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const CHANNEL_BADGE: Record<Channel, string> = {
  EMAIL: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  PUSH:  "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  BOTH:  "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
};
const CHANNEL_ICON: Record<Channel, React.ReactNode> = {
  EMAIL: <Mail     size={11} />,
  PUSH:  <Bell     size={11} />,
  BOTH:  <BellRing size={11} />,
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [showCompose, setShowCompose]     = useState(false);
  const [toast, setToast]                 = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const [form, setForm] = useState({
    event_id: "ALL" as number | "ALL",
    title: "",
    body: "",
    channel: "BOTH" as Channel,
  });

  function showToastMsg(msg: string) {
    setToast(msg); setTimeout(() => setToast(""), 3000);
  }

  function applyTemplate(templateId: string) {
    const tpl = ANNOUNCEMENT_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    const event = form.event_id !== "ALL" ? MOCK_EVENTS.find(e => e.id === Number(form.event_id)) : null;
    const date  = event?.dates?.[0] ? new Date(event.dates[0]).toLocaleDateString("en-IN", { day: "numeric", month: "long" }) : "{Date}";
    const fill  = (s: string) => s
      .replace(/{Event}/g, event?.name ?? "{Event}")
      .replace(/{Date}/g, date);
    setForm(prev => ({ ...prev, title: fill(tpl.title), body: fill(tpl.body) }));
    setSelectedTemplate(templateId);
  }

  function handleSend() {
    if (!form.title.trim() || !form.body.trim()) return;
    const selectedEvent = form.event_id !== "ALL" ? MOCK_EVENTS.find(e => e.id === Number(form.event_id)) : null;
    const newAnn: Announcement = {
      id:              `a${Date.now()}`,
      event_id:        form.event_id,
      event_name:      selectedEvent?.name ?? "All Events",
      title:           form.title.trim(),
      body:            form.body.trim(),
      channel:         form.channel,
      sent_at:         new Date().toISOString(),
      recipient_count: selectedEvent ? Math.floor(Math.random() * 200 + 50) : 850,
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    setForm({ event_id: "ALL", title: "", body: "", channel: "BOTH" });
    setSelectedTemplate("");
    setShowCompose(false);
    showToastMsg("Announcement sent successfully!");
  }

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-surface border border-border-c shadow-xl rounded-xl px-4 py-3 text-tx text-sm font-fira flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-500" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-tx font-marcellus text-xl sm:text-2xl mb-1">Announcements</h1>
          <p className="text-muted-tx text-sm font-fira">Send notifications to event participants.</p>
        </div>
        <button type="button" onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-fira font-semibold rounded-lg transition-colors">
          <Plus size={15} /> Compose
        </button>
      </div>

      {/* Compose modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-border-c rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-c sticky top-0 bg-surface z-10">
              <div className="flex items-center gap-2">
                <Megaphone size={16} className="text-red-500" />
                <h2 className="text-tx font-fira font-semibold">Compose Announcement</h2>
              </div>
              <button type="button" onClick={() => { setShowCompose(false); setSelectedTemplate(""); }}
                className="w-8 h-8 rounded-lg bg-surface2 hover:bg-red-500/10 text-muted-tx hover:text-red-500 flex items-center justify-center transition-all">
                <X size={15} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Target event */}
              <div>
                <label className="text-tx text-xs font-fira font-semibold uppercase tracking-wide mb-1.5 block">Target Event</label>
                <div className="relative">
                  <select value={form.event_id} onChange={e => setForm(prev => ({ ...prev, event_id: e.target.value === "ALL" ? "ALL" : Number(e.target.value) }))}
                    className={INPUT + " appearance-none pr-8"}>
                    <option value="ALL">All participants (broadcast)</option>
                    {MOCK_EVENTS.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-tx pointer-events-none" />
                </div>
              </div>

              {/* Channel */}
              <div>
                <label className="text-tx text-xs font-fira font-semibold uppercase tracking-wide mb-1.5 block">Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {CHANNEL_OPTIONS.map(ch => (
                    <button key={ch.value} type="button" onClick={() => setForm(prev => ({ ...prev, channel: ch.value }))}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-fira transition-all ${form.channel === ch.value ? "bg-red-500/10 border-red-500/40 text-red-500" : "bg-surface2 border-border-c text-muted-tx hover:text-tx"}`}>
                      {ch.icon} {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates */}
              <div>
                <label className="text-tx text-xs font-fira font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Lightbulb size={12} className="text-amber-500" /> Quick Templates
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ANNOUNCEMENT_TEMPLATES.map(tpl => (
                    <button key={tpl.id} type="button" onClick={() => applyTemplate(tpl.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-fira border transition-all ${selectedTemplate === tpl.id ? "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40 text-amber-600 dark:text-amber-400" : "bg-surface2 border-border-c text-muted-tx hover:text-tx"}`}>
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-tx text-xs font-fira font-semibold uppercase tracking-wide mb-1.5 block">Subject / Title</label>
                <input type="text" placeholder="e.g. Registration closing soon!" value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} className={INPUT} />
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-tx text-xs font-fira font-semibold uppercase tracking-wide">Message Body</label>
                  <span className={`text-[11px] font-fira ${form.body.length > 450 ? "text-red-500" : "text-subtle-tx"}`}>{form.body.length}/500</span>
                </div>
                <textarea rows={5} placeholder="Write your message here…" value={form.body} maxLength={500}
                  onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
                  className={INPUT + " resize-none leading-relaxed"} />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowCompose(false); setSelectedTemplate(""); }}
                  className="flex-1 py-2.5 border border-border-c rounded-xl text-sm font-fira text-muted-tx hover:text-tx hover:border-red-500/30 transition-all">
                  Cancel
                </button>
                <button type="button" onClick={handleSend} disabled={!form.title.trim() || !form.body.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-fira font-semibold rounded-xl transition-all">
                  <Send size={14} /> Send Announcement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-tx text-base font-fira font-semibold mb-4 flex items-center gap-2">
          <Megaphone size={15} /> Sent Announcements
          <span className="text-subtle-tx text-xs font-normal">({announcements.length})</span>
        </h2>
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Megaphone size={40} className="text-subtle-tx mb-4" />
            <p className="text-muted-tx font-fira text-sm">No announcements yet.</p>
            <button type="button" onClick={() => setShowCompose(true)} className="text-red-500 text-sm font-fira hover:underline mt-2">Send your first announcement →</button>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map(ann => (
              <div key={ann.id} className="bg-surface border border-border-c rounded-2xl p-4 sm:p-5 hover:border-red-500/20 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-tx text-sm font-fira font-semibold">{ann.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-[10px] font-fira text-subtle-tx">
                        <CalendarDays size={10} /> {fmtDate(ann.sent_at)}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-fira text-subtle-tx">
                        <Users size={10} /> {ann.recipient_count} recipients
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`flex items-center gap-1 text-[10px] font-fira px-2 py-0.5 rounded-md ${CHANNEL_BADGE[ann.channel]}`}>
                      {CHANNEL_ICON[ann.channel]} {ann.channel}
                    </span>
                  </div>
                </div>
                <p className="text-muted-tx text-xs font-fira leading-relaxed mb-2 line-clamp-2">{ann.body}</p>
                <div className="flex items-center gap-1.5 text-[10px] font-fira text-subtle-tx">
                  <Megaphone size={10} className="text-red-400" />
                  <span className="text-red-400 font-medium">{ann.event_name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
