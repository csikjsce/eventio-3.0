"use client";
import { useState, useEffect, useCallback } from "react";
import { useData } from "@/contexts/DataContext";
import { ANNOUNCEMENT_TEMPLATES } from "@/lib/dummy-data";
import {
  fetchAnnouncements, sendAnnouncement, deleteAnnouncement, type AnnouncementRow,
} from "@/lib/api";
import { Megaphone, Plus, X, Send, Mail, Bell, BellRing, ChevronDown, Users, Trash2, CheckCircle2, Lightbulb } from "lucide-react";
import EmailPreview from "@/components/EmailPreview";
import {
  BODY_FORMAT_OPTIONS,
  BODY_FORMAT_PLACEHOLDER,
  type EmailBodyFormat,
} from "@/lib/email-body";

const CHANNEL_OPTIONS = [
  { value: "EMAIL", label: "Email only",   icon: <Mail     size={14} /> },
  { value: "PUSH",  label: "Push only",    icon: <Bell     size={14} /> },
  { value: "BOTH",  label: "Email + Push", icon: <BellRing size={14} /> },
] as const;

type Channel = "EMAIL" | "PUSH" | "BOTH";

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

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AnnouncementsPage() {
  const { events } = useData();
  const [eventId, setEventId]             = useState<number | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [loadingList, setLoadingList]     = useState(false);
  const [showCompose, setShowCompose]     = useState(false);
  const [sending, setSending]             = useState(false);
  const [toast, setToast]                 = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const [form, setForm] = useState({
    title: "", body: "", channel: "BOTH" as Channel, bodyFormat: "plain" as EmailBodyFormat,
  });

  function showToastMsg(msg: string) {
    setToast(msg); setTimeout(() => setToast(""), 3000);
  }

  // Set first event as default
  useEffect(() => {
    if (events.length && eventId === null) setEventId(events[0].id);
  }, [events, eventId]);

  const loadAnnouncements = useCallback(async () => {
    if (!eventId) return;
    setLoadingList(true);
    try {
      const list = await fetchAnnouncements(eventId);
      setAnnouncements(list);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoadingList(false);
    }
  }, [eventId]);

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

  function applyTemplate(templateId: string) {
    const tpl = ANNOUNCEMENT_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    const event = eventId ? events.find(e => e.id === eventId) : null;
    const date  = event?.dates?.[0] ? new Date(event.dates[0]).toLocaleDateString("en-IN", { day: "numeric", month: "long" }) : "{Date}";
    const fill  = (s: string) => s.replace(/{Event}/g, event?.name ?? "{Event}").replace(/{Date}/g, date);
    setForm(prev => ({ ...prev, title: fill(tpl.title), body: fill(tpl.body) }));
    setSelectedTemplate(templateId);
  }

  async function handleSend() {
    if (!form.title.trim() || !form.body.trim() || !eventId) return;
    setSending(true);
    try {
      const res = await sendAnnouncement({
        event_id: eventId,
        title: form.title.trim(),
        body: form.body.trim(),
        channel: form.channel,
        body_format: form.bodyFormat,
      });
      setAnnouncements(prev => [res.announcement, ...prev]);
      setForm({ title: "", body: "", channel: "BOTH", bodyFormat: "plain" });
      setSelectedTemplate("");
      setShowCompose(false);
      showToastMsg(`Announcement sent! (${res.recipients_queued} queued)`);
    } catch {
      showToastMsg("Failed to send announcement. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: number) {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    try { await deleteAnnouncement(id); } catch { loadAnnouncements(); }
  }

  const selectedEvent = eventId ? events.find(e => e.id === eventId) : null;

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

      {/* Event picker */}
      <div className="relative w-full sm:w-72 mb-6">
        <select value={eventId ?? ""} onChange={e => setEventId(Number(e.target.value))}
          className="w-full bg-surface border border-border-c focus:border-red-500/40 rounded-xl px-4 py-2.5 text-sm font-fira text-tx outline-none appearance-none pr-8 transition-colors">
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-tx pointer-events-none" />
      </div>

      {/* History */}
      {loadingList ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-surface rounded-2xl" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center">
          <Megaphone size={40} className="text-subtle-tx mb-4" />
          <p className="text-muted-tx font-fira text-sm">No announcements sent for this event yet.</p>
          <button type="button" onClick={() => setShowCompose(true)} className="text-red-500 text-sm font-fira hover:underline mt-2">Compose first announcement →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => (
            <div key={ann.id} className="bg-surface border border-border-c rounded-2xl p-4 sm:p-5 group">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2 min-w-0">
                  <span className={`inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md text-[11px] font-fira font-medium mt-0.5 ${CHANNEL_BADGE[ann.channel as Channel]}`}>
                    {CHANNEL_ICON[ann.channel as Channel]} {ann.channel}
                  </span>
                  <p className="text-tx text-sm font-fira font-semibold leading-snug">{ann.title}</p>
                </div>
                <button type="button" onClick={() => handleDelete(ann.id)} className="opacity-0 group-hover:opacity-100 text-subtle-tx hover:text-red-500 transition-all shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-muted-tx text-xs font-fira leading-relaxed line-clamp-2 mb-3">{ann.body}</p>
              <div className="flex items-center gap-4 text-subtle-tx text-[11px] font-fira">
                <span className="flex items-center gap-1"><Users size={11} /> {ann.recipient_count} recipients</span>
                <span>{fmtDate(ann.sent_at)}</span>
                {ann.created_by && <span>by {ann.created_by.name}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-end lg:items-center justify-center p-0 lg:p-6">
          <div className="bg-surface border border-border-c rounded-t-3xl lg:rounded-2xl w-full lg:max-w-5xl xl:max-w-6xl shadow-2xl max-h-[92vh] lg:max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-c shrink-0">
              <h2 className="text-tx font-fira font-semibold text-base">New Announcement</h2>
              <button type="button" onClick={() => setShowCompose(false)} className="text-muted-tx hover:text-tx transition-colors"><X size={18} /></button>
            </div>

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
              <div className="flex-1 lg:flex-none lg:w-[min(100%,420px)] xl:w-[440px] overflow-y-auto px-5 py-5 space-y-4 lg:border-r lg:border-border-c">
              {/* Event */}
              <div>
                <label className="block text-muted-tx text-xs font-fira uppercase tracking-wider mb-1.5">Event</label>
                <div className="relative">
                  <select value={eventId ?? ""} onChange={e => setEventId(Number(e.target.value))}
                    className="w-full bg-surface2 border border-border-c rounded-lg px-3 py-2.5 text-sm font-fira text-tx outline-none appearance-none pr-8 focus:border-red-500/40 transition-colors">
                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-tx pointer-events-none" />
                </div>
                {selectedEvent && (
                  <p className="text-subtle-tx text-[11px] font-fira mt-1">Sends to all registered participants of this event.</p>
                )}
              </div>

              {/* Channel */}
              <div>
                <label className="block text-muted-tx text-xs font-fira uppercase tracking-wider mb-1.5">Channel</label>
                <div className="flex gap-2 flex-wrap">
                  {CHANNEL_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, channel: opt.value }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-fira border transition-all ${form.channel === opt.value ? "bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400" : "border-border-c text-muted-tx hover:text-tx"}`}>
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates */}
              <div>
                <label className="flex items-center gap-1.5 text-muted-tx text-xs font-fira uppercase tracking-wider mb-1.5">
                  <Lightbulb size={11} /> Quick Templates
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ANNOUNCEMENT_TEMPLATES.map(t => (
                    <button key={t.id} type="button" onClick={() => applyTemplate(t.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-fira border transition-all ${selectedTemplate === t.id ? "bg-red-500/10 border-red-500/30 text-red-500" : "border-border-c text-muted-tx hover:text-tx"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message format — email body only; header logos stay fixed */}
              {(form.channel === "EMAIL" || form.channel === "BOTH") && (
                <div>
                  <label className="block text-muted-tx text-xs font-fira uppercase tracking-wider mb-1.5">
                    Message format
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BODY_FORMAT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, bodyFormat: opt.value }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-fira border transition-all ${
                          form.bodyFormat === opt.value
                            ? "bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400"
                            : "border-border-c text-muted-tx hover:text-tx"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-subtle-tx text-[11px] font-fira mt-1.5 leading-relaxed">
                    {BODY_FORMAT_OPTIONS.find((o) => o.value === form.bodyFormat)?.hint}
                  </p>
                </div>
              )}

              {/* Title + Body */}
              <div>
                <label className="block text-muted-tx text-xs font-fira uppercase tracking-wider mb-1.5">Subject</label>
                <input type="text" value={form.title} placeholder="e.g. Registration closing soon!"
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="bg-surface2 border border-border-c focus:border-red-500/40 rounded-lg px-3 py-2 text-sm font-fira text-tx placeholder-subtle-tx outline-none transition-colors w-full" />
              </div>
              <div>
                <label className="block text-muted-tx text-xs font-fira uppercase tracking-wider mb-1.5">
                  {form.bodyFormat === "plain" ? "Message" : form.bodyFormat === "markdown" ? "Message (Markdown)" : "Message (HTML)"}
                </label>
                <textarea
                  value={form.body}
                  rows={form.bodyFormat === "plain" ? 5 : 8}
                  placeholder={BODY_FORMAT_PLACEHOLDER[form.bodyFormat]}
                  onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                  className={`bg-surface2 border border-border-c focus:border-red-500/40 rounded-lg px-3 py-2 text-sm font-fira text-tx placeholder-subtle-tx outline-none transition-colors w-full resize-y min-h-[120px] lg:min-h-[160px] ${
                    form.bodyFormat !== "plain" ? "font-mono text-[13px] leading-relaxed" : ""
                  }`}
                />
                <p className="text-subtle-tx text-[11px] font-fira text-right mt-0.5">{form.body.length} chars</p>
              </div>

              {(form.channel === "EMAIL" || form.channel === "BOTH") && (
                <div className="lg:hidden">
                  <label className="block text-muted-tx text-xs font-fira uppercase tracking-wider mb-1.5">Email preview</label>
                  <EmailPreview
                    title={form.title}
                    body={form.body}
                    eventName={selectedEvent?.name}
                    bodyFormat={form.bodyFormat}
                  />
                </div>
              )}
              </div>

              <div className="hidden lg:flex flex-1 min-w-0 flex-col overflow-y-auto bg-zinc-100/80 dark:bg-zinc-900/40 p-6">
                <p className="text-muted-tx text-xs font-fira uppercase tracking-wider mb-4 shrink-0">
                  {form.channel === "PUSH" ? "Push preview" : "Email preview"}
                </p>
                <div className="flex-1 flex items-start justify-center min-h-0">
                  {form.channel === "EMAIL" || form.channel === "BOTH" ? (
                    <div className="w-full max-w-xl">
                      <EmailPreview
                        title={form.title}
                        body={form.body}
                        eventName={selectedEvent?.name}
                        bodyFormat={form.bodyFormat}
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-sm bg-surface border border-border-c rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                          <Bell size={18} className="text-red-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-fira text-muted-tx">Eventio · now</p>
                          <p className="text-sm font-fira font-semibold text-tx mt-0.5 leading-snug">
                            {form.title.trim() || "Notification title"}
                          </p>
                          <p className="text-xs font-fira text-muted-tx mt-1 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                            {form.body.trim() || "Message preview…"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border-c shrink-0">
              <button type="button" onClick={() => setShowCompose(false)} className="px-4 py-2 text-sm font-fira text-muted-tx border border-border-c hover:border-red-500/20 rounded-lg transition-all">Cancel</button>
              <button type="button" onClick={handleSend} disabled={!form.title.trim() || !form.body.trim() || !eventId || sending}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-fira font-semibold rounded-lg transition-all ${!form.title.trim() || !form.body.trim() || !eventId || sending ? "bg-surface2 text-muted-tx cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}>
                <Send size={13} /> {sending ? "Sending…" : "Send Announcement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
