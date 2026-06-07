"use client";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { newEventSchema, type NewEventSchema } from "@/lib/validation";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import NumberInput from "@/components/NumberInput";
import RegistrationFieldsEditor from "@/components/RegistrationFieldsEditor";
import type { RegistrationField } from "@/lib/registration-fields";
import { normalizeRegistrationFields } from "@/lib/registration-fields";
import { useData } from "@/contexts/DataContext";
import { createEvent, updateEvent, toEventUpdatePayload } from "@/lib/api";
import { uploadFile } from "@/lib/upload";
import {
  Trophy, Wrench, Mic2, Monitor, Sparkles,
  CheckCircle2, ChevronRight, X, Save, Upload,
} from "lucide-react";

/* ─── helpers ─── */
function dateToString(d: Date) {
  return d.toLocaleString("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).replace(", ", "T").slice(0, 16);
}

/* ─── style tokens ─── */
const INPUT =
  "w-full bg-surface2 border border-border-c focus:border-red-500/50 rounded-lg px-3 py-2.5 text-tx text-sm font-fira outline-none transition-colors placeholder:text-subtle-tx";
const LABEL = "block text-muted-tx text-xs font-fira font-medium uppercase tracking-wider mb-1.5";
const ERR   = "text-red-500 text-xs font-fira mt-1";
const SECTION_TITLE = "text-tx text-base font-fira font-semibold";
const SECTION_SUB   = "text-muted-tx text-sm font-fira mt-0.5 mb-4";

/* ─── sub-components ─── */
function Toggle({ on, onToggle, label, sub }: { on: boolean; onToggle(): void; label: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-4 px-5 bg-surface2 border border-border-c rounded-xl">
      <div>
        <p className="text-tx text-sm font-fira font-semibold">{label}</p>
        {sub && <p className="text-muted-tx text-xs font-fira mt-0.5">{sub}</p>}
      </div>
      <div
        onClick={onToggle}
        className={`w-11 h-6 rounded-full relative shrink-0 cursor-pointer transition-colors ${on ? "bg-red-500" : "bg-zinc-300 dark:bg-zinc-600"}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
      </div>
    </div>
  );
}

function RadioCard({
  selected, onSelect, icon, label, description,
}: { selected: boolean; onSelect(): void; icon?: React.ReactNode; label: string; description?: string }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col gap-2 p-4 rounded-xl border text-left transition-all bg-surface2 ${
        selected
          ? "border-red-500/50 ring-1 ring-red-500/20"
          : "border-border-c hover:border-red-500/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
            selected ? "border-red-500" : "border-zinc-600"
          }`}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-red-500" />}
        </div>
        {icon && <span className="text-zinc-400">{icon}</span>}
      </div>
      <div>
        <p className="text-tx text-sm font-fira font-semibold">{label}</p>
        {description && <p className="text-subtle-tx text-xs font-fira mt-0.5 leading-relaxed">{description}</p>}
      </div>
    </button>
  );
}

function FieldWrap({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={LABEL}>{label}</label>
      {children}
      {error && <p className={ERR}>{error}</p>}
    </div>
  );
}

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5 pb-4 border-b border-border-c">
      <p className={SECTION_TITLE}>{title}</p>
      {sub && <p className={SECTION_SUB}>{sub}</p>}
    </div>
  );
}

function ReviewRow({ label, value, step, onJump }: { label: string; value: string; step: number; onJump(s: number): void }) {
  return (
    <div className="flex items-start sm:items-center justify-between gap-3 py-3 px-4 bg-surface2 border border-border-c rounded-xl">
      <span className="text-muted-tx text-xs font-fira uppercase tracking-wide shrink-0">{label}</span>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-tx text-sm font-fira truncate">{value}</span>
        <button type="button" onClick={() => onJump(step)} className="text-subtle-tx hover:text-red-500 text-xs font-fira transition-colors shrink-0">Edit</button>
      </div>
    </div>
  );
}

/* ─── step config ─── */
const STEPS = [
  { id: 1, label: "Basics",       sub: "Name, tagline & images" },
  { id: 2, label: "Schedule",     sub: "Dates, type & venue" },
  { id: 3, label: "Registration", sub: "Tickets, fees & teams" },
  { id: 4, label: "Features",     sub: "Attendance, activity & forms" },
  { id: 5, label: "Media",        sub: "Links & social handles" },
  { id: 6, label: "Review",       sub: "Summary & submit" },
];

/* ─── page ─── */
export default function NewEventPage() {
  const router  = useRouter();
  const params  = useParams();
  const { events, refreshEvents } = useData();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const existing = idParam ? events.find(e => String(e.id) === idParam) ?? null : null;

  const [step, setStep]               = useState(1);
  const [startDate, setStartDate]     = useState(dateToString(new Date()));
  const [endDate, setEndDate]         = useState(dateToString(new Date()));
  const [endTime, setEndTime]         = useState("18:00");   // single-day end time (HH:mm)
  const [multiDay, setMultiDay]       = useState(false);
  const [teamEvent, setTeamEvent]     = useState(false);
  const [femaleQuota, setFemaleQuota] = useState(false);
  const [showParent, setShowParent]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null);
  const [uploadingBanner, setUploadingBanner]   = useState(false);
  const [uploadingDetail, setUploadingDetail]   = useState(false);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const detailFileRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = useForm<NewEventSchema>({ resolver: yupResolver(newEventSchema) as any,
    defaultValues: {
      fee: 0, is_ticket_feature_enabled: true, ma_ppt: 1, min_ppt: 1,
      state: "DRAFT",
      is_feedback_enabled: false, is_only_somaiya: true,
      registration_type: "ONPLATFORM", more_details_enabled: false,
      registration_fields: [] as RegistrationField[],
      is_submission_enabled: false,
      urls: { instagram: "", facebook: "", linkedin: "", other: "" },
    },
  });

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = methods;

  useEffect(() => {
    if (existing) {
      methods.reset({
        ...toEventUpdatePayload(existing as unknown as Record<string, unknown>),
        dates: existing.dates.map((d) => new Date(d)),
        registration_fields: existing.registration_fields ?? [],
        urls: existing.urls ?? { instagram: "", facebook: "", linkedin: "", other: "" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      if (existing.dates[0]) setStartDate(dateToString(new Date(existing.dates[0])));
      if (existing.dates.length > 1) {
        const last = new Date(existing.dates[existing.dates.length - 1]);
        setEndDate(dateToString(last));
        // Detect multi-day: end date is a different calendar day from start
        const start = new Date(existing.dates[0]);
        const isDifferentDay = last.toDateString() !== start.toDateString();
        if (isDifferentDay) {
          setMultiDay(true);
        } else {
          // Same day — store end time for the single-day time picker
          setEndTime(`${String(last.getHours()).padStart(2,"0")}:${String(last.getMinutes()).padStart(2,"0")}`);
        }
      }
      if (existing.ma_ppt > 1) setTeamEvent(true);
    }
  }, []);

  useEffect(() => {
    const start = new Date(startDate);
    if (!multiDay) {
      // Build end datetime: same date as start, but with the chosen end time
      const [hh, mm] = endTime.split(":").map(Number);
      const end = new Date(start);
      end.setHours(hh ?? 23, mm ?? 59, 0, 0);
      // If end time is before or equal start time, push to next day
      if (end <= start) end.setDate(end.getDate() + 1);
      setValue("dates", [start, end]);
      return;
    }
    // Multi-day: store [startDatetime, endDatetime] — no per-day expansion needed
    const end = new Date(endDate);
    if (end < start) setValue("dates", [start]);
    else setValue("dates", [start, end]);
  }, [startDate, endDate, endTime, multiDay]);

  useEffect(() => { if (!teamEvent) { setValue("ma_ppt", 1); setValue("min_ppt", 1); } }, [teamEvent]);
  useEffect(() => { if (!femaleQuota) setValue("female_requirement", null); }, [femaleQuota]);

  type FormKey = Parameters<typeof trigger>[0];
  const STEP_FIELDS: Record<number, FormKey[]> = {
    1: ["name", "tag_line", "description", "long_description", "event_page_image_url", "banner_url"],
    2: ["event_type", "dates", "venue", "online_event_link"],
    3: ["fee", "ticket_count", "external_registration_link", "min_ppt", "ma_ppt"],
    4: ["registration_fields"], 5: [],
  };

  async function goNext() {
    const fields = STEP_FIELDS[step] ?? [];
    const valid  = fields.length === 0 || await trigger(fields as Parameters<typeof trigger>[0]);
    if (valid) setStep(s => Math.min(STEPS.length, s + 1));
  }

  async function saveDraft() {
    const data = methods.getValues();
    data.logo_image_url = data.event_page_image_url;
    if (!showParent) data.parent_id = null;
    if (data.registration_fields) {
      data.registration_fields = normalizeRegistrationFields(
        data.registration_fields as RegistrationField[],
      );
    }
    setLoading(true);
    try {
      if (existing) {
        await updateEvent(existing.id, data as unknown as Record<string, unknown>);
      } else {
        await createEvent(data as unknown as Record<string, unknown>);
      }
      await refreshEvents();
      setToast({ msg: "Draft saved.", ok: true });
    } catch {
      setToast({ msg: "Failed to save draft.", ok: false });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 2500);
    }
  }

  const onSubmit = async (data: NewEventSchema) => {
    data.logo_image_url = data.event_page_image_url;
    if (!showParent) data.parent_id = null;
    if (data.registration_fields) {
      data.registration_fields = normalizeRegistrationFields(
        data.registration_fields as RegistrationField[],
      );
    }
    setLoading(true);
    try {
      if (existing) {
        await updateEvent(existing.id, data as unknown as Record<string, unknown>);
        setToast({ msg: "Event updated!", ok: true });
      } else {
        await createEvent(data as unknown as Record<string, unknown>);
        setToast({ msg: "Event created as Draft!", ok: true });
      }
      await refreshEvents();
      setTimeout(() => { setToast(null); router.push("/"); }, 1800);
    } catch {
      setToast({ msg: "Failed to save event. Please try again.", ok: false });
    } finally {
      setLoading(false);
    }
  };

  /* watched values */
  const eventType     = watch("event_type");
  const isExternal    = watch("registration_type") === "EXTERNAL";
  const feedbackOn    = watch("is_feedback_enabled") ?? false;
  const moreDetails   = watch("more_details_enabled") ?? false;
  const regFields     = watch("registration_fields") ?? [];
  const submission    = watch("is_submission_enabled") ?? false;
  const wName         = watch("name");
  const wFee          = watch("fee");
  const wTickets      = watch("ticket_count");
  const wVenue        = watch("venue");
  const wType         = watch("event_type");
  const wRegType      = watch("registration_type");
  const wAttendance   = watch("attendance_type");

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col min-h-screen bg-bg transition-colors">

        {/* ── Top action bar ── */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-b border-border-c bg-surface sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 text-muted-tx text-[11px] font-fira mb-0.5">
              <span className="hover:text-tx cursor-pointer" onClick={() => router.push("/")}>Events</span>
              <ChevronRight size={11} />
              <span className="text-tx">{existing ? "Edit Event" : "New Event"}</span>
            </div>
            <p className="text-tx text-sm font-fira font-semibold">{STEPS[step - 1].label}</p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button type="button" onClick={() => router.push("/")}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 text-sm font-fira text-muted-tx hover:text-tx border border-border-c hover:border-red-500/20 rounded-lg transition-all">
              <X size={13} /> <span className="hidden sm:inline">Cancel</span>
            </button>
            <button type="button" onClick={saveDraft} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 text-sm font-fira text-muted-tx border border-border-c hover:border-red-500/20 hover:text-tx rounded-lg transition-all disabled:opacity-40">
              <Save size={13} /> <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0">

          {/* Step sidebar */}
          <aside className="hidden md:block w-52 shrink-0 bg-surface border-r border-border-c py-6 overflow-y-auto">
            {STEPS.map(s => {
              const done   = step > s.id;
              const active = step === s.id;
              return (
                <button key={s.id} type="button"
                  onClick={() => { if (s.id <= step) setStep(s.id); }}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all border-l-2 ${
                    active
                      ? "border-l-red-500 bg-red-500/[0.08]"
                        : done
                          ? "border-l-transparent hover:bg-surface2"
                          : "border-l-transparent opacity-40 cursor-default"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 size={18} className="text-red-500 shrink-0" />
                  ) : (
                    <div className={`w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center text-[10px] font-fira font-bold ${active ? "border-red-500 text-red-500" : "border-border-c text-subtle-tx"}`}>
                      {s.id}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm font-fira font-medium leading-tight ${active ? "text-red-500" : done ? "text-tx" : "text-subtle-tx"}`}>{s.label}</p>
                    <p className="text-subtle-tx text-[10px] font-fira mt-0.5 truncate">{s.sub}</p>
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Mobile step progress */}
          <div className="md:hidden border-b border-border-c bg-surface">
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 overflow-x-auto scrollbar-hide">
              {STEPS.map(s => {
                const done = step > s.id; const active = step === s.id;
                return (
                  <button key={s.id} type="button" onClick={() => s.id <= step && setStep(s.id)}
                    className={`flex items-center justify-center shrink-0 w-7 h-7 rounded-full text-[11px] font-fira font-bold transition-all ${active ? "bg-red-500 text-white" : done ? "bg-surface2 text-emerald-500 border border-emerald-500/40" : "text-subtle-tx border border-border-c"}`}>
                    {done ? "✓" : s.id}
                  </button>
                );
              })}
              <div className="ml-2 shrink-0">
                <p className="text-tx text-xs font-fira font-semibold">{STEPS[step - 1].label}</p>
                <p className="text-subtle-tx text-[10px] font-fira">{STEPS[step - 1].sub}</p>
              </div>
            </div>
            {/* progress bar */}
            <div className="h-0.5 bg-surface2">
              <div className="h-full bg-red-500 transition-all" style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
            </div>
          </div>

          {/* Form content */}
          <main className="flex-1 overflow-y-auto min-h-0">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="max-w-2xl mx-auto px-4 py-6 sm:px-8 sm:py-8">

                {/* ── 1: Basics ── */}
                {step === 1 && (
                  <div className="space-y-7">
                    <SectionHead title="Basic Information" sub="The core identity of your event shown across the platform." />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldWrap label="Event Name *" error={errors.name?.message}><input className={INPUT} {...register("name")} placeholder="e.g. HackSphere 2026" /></FieldWrap>
                      <FieldWrap label="Tagline *" error={errors.tag_line?.message}><input className={INPUT} {...register("tag_line")} placeholder="e.g. Code. Create. Conquer." /></FieldWrap>
                    </div>
                    <FieldWrap label="Short Description *" error={errors.description?.message}><textarea rows={3} className={`${INPUT} resize-none`} {...register("description")} placeholder="2–3 lines shown on event cards." /></FieldWrap>
                    <FieldWrap label="Full Description *" error={errors.long_description?.message}><textarea rows={6} className={`${INPUT} resize-none`} {...register("long_description")} placeholder="Detailed overview of the event for the event page." /></FieldWrap>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldWrap label="Card / Banner Image (16:9) *" error={errors.banner_url?.message}>
                        <div className="flex gap-2">
                          <input className={`${INPUT} flex-1 min-w-0`} {...register("banner_url")} placeholder="https://… or upload →" />
                          <input ref={bannerFileRef} type="file" accept="image/*" className="hidden"
                            onChange={async e => {
                              const f = e.target.files?.[0]; if (!f) return;
                              setUploadingBanner(true);
                              try { setValue("banner_url", await uploadFile(f, "eventio-event-images")); }
                              catch { /* keep existing value */ }
                              finally { setUploadingBanner(false); e.target.value = ""; }
                            }} />
                          <button type="button" onClick={() => bannerFileRef.current?.click()} disabled={uploadingBanner}
                            className="shrink-0 px-3 py-2 bg-surface2 border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx rounded-lg transition-all disabled:opacity-60 text-xs font-fira flex items-center gap-1">
                            <Upload size={13} />{uploadingBanner ? "…" : ""}
                          </button>
                        </div>
                      </FieldWrap>
                      <FieldWrap label="Detail Page Image (1:1) *" error={errors.event_page_image_url?.message}>
                        <div className="flex gap-2">
                          <input className={`${INPUT} flex-1 min-w-0`} {...register("event_page_image_url")} placeholder="https://… or upload →" />
                          <input ref={detailFileRef} type="file" accept="image/*" className="hidden"
                            onChange={async e => {
                              const f = e.target.files?.[0]; if (!f) return;
                              setUploadingDetail(true);
                              try { setValue("event_page_image_url", await uploadFile(f, "eventio-event-images")); }
                              catch { /* keep existing value */ }
                              finally { setUploadingDetail(false); e.target.value = ""; }
                            }} />
                          <button type="button" onClick={() => detailFileRef.current?.click()} disabled={uploadingDetail}
                            className="shrink-0 px-3 py-2 bg-surface2 border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx rounded-lg transition-all disabled:opacity-60 text-xs font-fira flex items-center gap-1">
                            <Upload size={13} />{uploadingDetail ? "…" : ""}
                          </button>
                        </div>
                      </FieldWrap>
                    </div>

                    <div>
                      <p className={LABEL}>Hierarchy</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <RadioCard selected={!showParent} onSelect={() => setShowParent(false)} label="Main Event" description="Standalone top-level event visible on the discover feed." />
                        <RadioCard selected={showParent}  onSelect={() => setShowParent(true)}  label="Sub-Event"  description="Nested under a parent event in the same series." />
                      </div>
                    </div>
                    {showParent && (
                      <FieldWrap label="Parent Event *">
                        <select className={INPUT} {...register("parent_id")}>
                          <option value={-1}>Select parent event…</option>
                          {events.filter((e: { id: number; name: string }) => e.id !== existing?.id).map((ev: { id: number; name: string }) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                        </select>
                      </FieldWrap>
                    )}
                  </div>
                )}

                {/* ── 2: Schedule ── */}
                {step === 2 && (
                  <div className="space-y-7">
                    <SectionHead title="Schedule & Venue" sub="When and where your event takes place." />

                    <div>
                      <p className={LABEL}>Event Type *</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { val: "COMPETETION",    label: "Competition",      icon: <Trophy size={17} />, desc: "Judged contest with prizes" },
                          { val: "WORKSHOP",       label: "Workshop",         icon: <Wrench size={17} />, desc: "Hands-on learning session" },
                          { val: "SPEAKER_SESSION",label: "Speaker Session",  icon: <Mic2   size={17} />, desc: "Talk by industry expert" },
                          { val: "ONLINE",         label: "Online Event",     icon: <Monitor size={17}/>, desc: "Fully virtual session" },
                          { val: "FEST",           label: "Fest",             icon: <Sparkles size={17}/>,desc: "Multi-activity college fest" },
                        ].map(o => (
                          <RadioCard key={o.val} selected={eventType === o.val} onSelect={() => setValue("event_type", o.val as NewEventSchema["event_type"])} icon={o.icon} label={o.label} description={o.desc} />
                        ))}
                      </div>
                      {errors.event_type && <p className={ERR}>{errors.event_type.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldWrap label={multiDay ? "Start Date & Time *" : "Event Date & Time *"}>
                        <input type="datetime-local" className={INPUT} value={startDate} onChange={e => setStartDate(e.target.value)} />
                      </FieldWrap>
                      <FieldWrap label={multiDay ? "End Date & Time *" : "End Time *"}>
                        {multiDay ? (
                          <input type="datetime-local" className={INPUT} value={endDate} onChange={e => setEndDate(e.target.value)} />
                        ) : (
                          <input type="time" className={INPUT} value={endTime} onChange={e => setEndTime(e.target.value)} />
                        )}
                      </FieldWrap>
                    </div>

                    <Toggle on={multiDay} onToggle={() => setMultiDay(!multiDay)} label="Multi-day Event" sub="Event spans across more than one calendar day." />

                    <FieldWrap
                      label={eventType === "ONLINE" ? "Online Meeting Link *" : "Venue *"}
                      error={eventType === "ONLINE" ? errors.online_event_link?.message : errors.venue?.message}
                    >
                      <input className={INPUT}
                        {...register(eventType === "ONLINE" ? "online_event_link" : "venue")}
                        placeholder={eventType === "ONLINE" ? "https://meet.google.com/…" : "e.g. KJSCE Auditorium, Vidyavihar"} />
                    </FieldWrap>
                  </div>
                )}

                {/* ── 3: Registration ── */}
                {step === 3 && (
                  <div className="space-y-7">
                    <SectionHead title="Registration & Tickets" sub="How students sign up and what it costs them." />

                    <div>
                      <p className={LABEL}>Registration Mode</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <RadioCard selected={!isExternal} onSelect={() => setValue("registration_type", "ONPLATFORM")} label="On-Platform" description="Registrations handled through the Eventio student app." />
                        <RadioCard selected={isExternal}  onSelect={() => setValue("registration_type", "EXTERNAL")}   label="External Form" description="Redirect to Unstop, Google Form, Devfolio, etc." />
                      </div>
                    </div>

                    {isExternal ? (
                      <FieldWrap label="External Registration Link *" error={errors.external_registration_link?.message}>
                        <input className={INPUT} {...register("external_registration_link")} placeholder="https://unstop.com/p/your-event" />
                      </FieldWrap>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FieldWrap label="Total Seats *" error={errors.ticket_count?.message}>
                          <NumberInput min={1} className="w-full" {...register("ticket_count")} placeholder="e.g. 300" />
                        </FieldWrap>
                        <FieldWrap label="Entry Fee (₹) *" error={errors.fee?.message}>
                          <NumberInput min={0} className="w-full" {...register("fee")} placeholder="0 for free" />
                        </FieldWrap>
                      </div>
                    )}

                    <Toggle on={teamEvent} onToggle={() => setTeamEvent(!teamEvent)} label="Team Participation" sub="Allow students to register as a group." />
                    {teamEvent && (
                      <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-red-600/30">
                        <FieldWrap label="Min Members" error={errors.min_ppt?.message}><NumberInput min={1} className="w-full" {...register("min_ppt")} /></FieldWrap>
                        <FieldWrap label="Max Members" error={errors.ma_ppt?.message}><NumberInput min={1} className="w-full" {...register("ma_ppt")} /></FieldWrap>
                      </div>
                    )}

                    <Toggle on={femaleQuota} onToggle={() => setFemaleQuota(!femaleQuota)} label="Female Seat Reservation" sub="Reserve a number of seats exclusively for female participants." />
                    {femaleQuota && (
                      <FieldWrap label="Reserved Female Seats" error={undefined}>
                        <NumberInput min={0} className="w-full" {...register("female_requirement")} placeholder="e.g. 50" />
                      </FieldWrap>
                    )}

                    <div className="flex items-center justify-between py-4 px-5 bg-surface2 border border-border-c rounded-xl">
                      <div>
                        <p className="text-tx text-sm font-fira font-semibold">Somaiya Students Only</p>
                        <p className="text-muted-tx text-xs font-fira mt-0.5">Restrict event registration to Somaiya Vidyavihar University students.</p>
                      </div>
                      <input type="checkbox" className="accent-red-600 w-4 h-4" {...register("is_only_somaiya")} />
                    </div>
                  </div>
                )}

                {/* ── 4: Features ── */}
                {step === 4 && (
                  <div className="space-y-7">
                    <SectionHead title="Event Features" sub="Configure advanced capabilities for your event." />

                    <div>
                      <p className={LABEL}>Attendance Tracking</p>
                      <p className="text-zinc-500 text-xs font-fira mb-3">How participant attendance is recorded on the day of the event.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { val: null,     label: "None",        desc: "No in-app tracking"       },
                          { val: "TICKET", label: "Ticket Scan", desc: "QR code at the gate"      },
                          { val: "BLE",    label: "BLE Beacon",  desc: "Bluetooth proximity check" },
                        ].map(o => (
                          <RadioCard key={String(o.val)} selected={wAttendance === o.val}
                            onSelect={() => setValue("attendance_type", o.val as NewEventSchema["attendance_type"])}
                            label={o.label} description={o.desc} />
                        ))}
                      </div>
                    </div>

                    <Toggle on={feedbackOn}   onToggle={() => setValue("is_feedback_enabled",   !feedbackOn)}  label="Post-Event Feedback"      sub="Send a feedback form to all participants after the event ends." />
                    <Toggle on={submission}   onToggle={() => setValue("is_submission_enabled", !submission)}   label="Project Submissions"      sub="Allow participants to submit files or links as project deliverables." />
                    <Toggle on={moreDetails}  onToggle={() => {
                      const next = !moreDetails;
                      setValue("more_details_enabled", next);
                      if (next && regFields.length === 0) {
                        setValue("registration_fields", [{
                          id: "answer",
                          label: "",
                          type: "text",
                          required: true,
                        }]);
                      }
                    }}  label="Extra Registration Fields" sub="Collect additional info from registrants beyond name and email." />
                    {moreDetails && (
                      <RegistrationFieldsEditor
                        fields={regFields as RegistrationField[]}
                        onChange={(fields) => setValue("registration_fields", fields, { shouldValidate: true })}
                      />
                    )}
                    {errors.registration_fields?.message && (
                      <p className="text-red-400 text-xs font-fira">{String(errors.registration_fields.message)}</p>
                    )}

                    <FieldWrap label="In-Event Live Activity (optional)">
                      <input className={INPUT} {...register("in_event_activity")} placeholder="https://quiz.example.com/live/…" />
                      <label className="flex items-center gap-2.5 mt-2 cursor-pointer select-none">
                        <input type="checkbox" className="accent-red-600 w-4 h-4" {...register("start_in_event_activity")} />
                        <p className="text-zinc-400 text-xs font-fira">Auto-launch when event goes Ongoing</p>
                      </label>
                    </FieldWrap>

                    <FieldWrap label="Tags (comma-separated, max 5)">
                      <input className={INPUT} {...register("tags")} placeholder="Hackathon, AI, Web Dev" />
                    </FieldWrap>
                  </div>
                )}

                {/* ── 5: Media ── */}
                {step === 5 && (
                  <div className="space-y-7">
                    <SectionHead title="Media & Links" sub="Help students find and follow your event online." />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {([
                        { key: "urls.instagram" as const, label: "Instagram",       ph: "https://instagram.com/…" },
                        { key: "urls.facebook"  as const, label: "Facebook",        ph: "https://facebook.com/…"  },
                        { key: "urls.linkedin"  as const, label: "LinkedIn",        ph: "https://linkedin.com/company/…" },
                        { key: "urls.other"     as const, label: "Website / Other", ph: "https://your-event.com"  },
                      ] as const).map(f => (
                        <FieldWrap key={f.key} label={f.label}>
                          <input className={INPUT} {...register(f.key)} placeholder={f.ph} />
                        </FieldWrap>
                      ))}
                    </div>
                    <FieldWrap label="Post-Event Report URL (optional)">
                      <input className={INPUT} {...register("report_url")} placeholder="https://drive.google.com/…" />
                    </FieldWrap>
                  </div>
                )}

                {/* ── 6: Review ── */}
                {step === 6 && (
                  <div className="space-y-5">
                    <SectionHead title={`Review Before ${existing ? "Updating" : "Submitting"}`} sub="Double-check everything. Click Edit on any row to go back." />
                    <div className="space-y-2">
                      <ReviewRow label="Event Name"    value={wName || "—"}              step={1} onJump={setStep} />
                      <ReviewRow label="Event Type"    value={wType?.replace(/_/g," ") || "—"} step={2} onJump={setStep} />
                      <ReviewRow label="Venue / Link"  value={wVenue || watch("online_event_link") || "—"} step={2} onJump={setStep} />
                      <ReviewRow label="Date(s)"       value={multiDay ? `${startDate} → ${endDate}` : startDate} step={2} onJump={setStep} />
                      <ReviewRow label="Registration"  value={wRegType === "EXTERNAL" ? "External Form" : `On-Platform · ${wTickets ?? "—"} seats`} step={3} onJump={setStep} />
                      <ReviewRow label="Entry Fee"     value={wFee === 0 ? "Free" : `₹${wFee}`} step={3} onJump={setStep} />
                      <ReviewRow label="Team Event"    value={teamEvent ? `Yes · ${watch("min_ppt")}–${watch("ma_ppt")} members` : "Individual"} step={3} onJump={setStep} />
                      <ReviewRow label="Female Seats"  value={femaleQuota ? `${watch("female_requirement") ?? 0} reserved` : "None"} step={3} onJump={setStep} />
                      <ReviewRow label="Attendance"    value={wAttendance || "None"} step={4} onJump={setStep} />
                      <ReviewRow label="Submissions"   value={submission ? "Enabled" : "Disabled"} step={4} onJump={setStep} />
                      <ReviewRow label="Feedback"      value={feedbackOn ? "Enabled" : "Disabled"} step={4} onJump={setStep} />
                    </div>
                    {!existing && (
                      <p className="text-muted-tx text-xs font-fira bg-surface2 border border-border-c rounded-xl p-4 leading-relaxed">
                        After creating, the event will be saved as a <span className="text-tx font-semibold">Draft</span>. It will appear only after it receives Dean&apos;s approval and you move it to <em>Registration Open</em>.
                      </p>
                    )}
                  </div>
                )}

                {/* Step nav footer */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-border-c">
                  <button type="button" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
                    className="px-5 py-2.5 text-sm font-fira text-muted-tx hover:text-tx border border-border-c hover:border-red-500/20 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    ← Back
                  </button>
                  {step < STEPS.length ? (
                    <button type="button" onClick={goNext}
                      className="flex items-center gap-1.5 px-6 py-2.5 bg-red-600 hover:bg-red-600 text-white text-sm font-fira font-semibold rounded-lg transition-colors">
                      Continue <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button type="button" onClick={handleSubmit(onSubmit)} disabled={loading}
                      className={`flex items-center gap-2 px-6 py-2.5 text-white text-sm font-fira font-semibold rounded-lg transition-colors ${loading ? "bg-red-700/50 cursor-not-allowed" : "bg-red-600 hover:bg-red-600"}`}>
                      {loading ? <Spinner /> : existing ? "Update Event" : "Create Event"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-fira shadow-2xl border z-50 ${toast.ok ? "bg-green-900/90 border-green-600/30 text-green-300" : "bg-red-900/90 border-red-600/30 text-red-300"}`}>
          {toast.msg}
        </div>
      )}
    </FormProvider>
  );
}
