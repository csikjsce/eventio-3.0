import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { NewEventSchema, newEventSchema } from '../utils/validation';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Spinner from '../components/Spinner';
import Loader from '../components/Loader';
import { useNavigate, useParams } from 'react-router-dom';
import UserDataContext from '../contexts/UserDataContext';
import EventsDataContext from '../contexts/EventsDataContext';

function dateToString(date: Date) {
  const formatted = date.toLocaleString('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  return formatted.replace(', ', 'T').slice(0, 16);
}

const INPUT = 'w-full bg-[#0d0d0d] border border-white/10 focus:border-red-600/50 rounded-lg px-3 py-2.5 text-white text-sm font-fira outline-none transition-colors placeholder:text-zinc-600';
const LABEL = 'block text-zinc-400 text-xs font-fira font-medium uppercase tracking-wider mb-1';
const ERROR = 'text-red-500 text-xs font-fira mt-0.5';
const FIELD = 'flex flex-col';

// Section container for grouping related controls inside a step
const SECTION = 'p-5 bg-[#0d0d0d] border border-white/[0.06] rounded-xl space-y-4';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className={`w-10 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${on ? 'bg-red-600' : 'bg-zinc-700'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </div>
  );
}

function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-1">
      <p className="text-white text-sm font-fira font-semibold">{title}</p>
      {desc && <p className="text-zinc-500 text-xs font-fira mt-0.5">{desc}</p>}
    </div>
  );
}

const STEPS = [
  { id: 1, label: 'Basics',       desc: 'Name, tagline & images' },
  { id: 2, label: 'Schedule',     desc: 'Dates, type & venue' },
  { id: 3, label: 'Registration', desc: 'Tickets, fees & teams' },
  { id: 4, label: 'Features',     desc: 'Attendance, activity & forms' },
  { id: 5, label: 'Media',        desc: 'Links & social handles' },
  { id: 6, label: 'Review',       desc: 'Summary & submit' },
];

export default function NewEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [step, setStep] = useState(1);

  const { userData } = useContext(UserDataContext);
  const { eventsList, refreshEventsData } = useContext(EventsDataContext);

  const events = eventsList
    .filter((e) => ['UPCOMING','REGISTRATION_OPEN','REGISTRATION_CLOSED','TICKET_OPEN','TICKET_CLOSED','ONGOING'].includes(e.state))
    .sort((a, b) => a.name.localeCompare(b.name));

  const methods = useForm<NewEventSchema>({
    resolver: yupResolver(newEventSchema),
    defaultValues: {
      fee: 0, is_ticket_feature_enabled: true, ma_ppt: 1, min_ppt: 1,
      is_feedback_enabled: false, is_only_somaiya: true,
      registration_type: 'ONPLATFORM',
      more_details_enabled: false, is_submission_enabled: false,
      urls: { instagram: '', facebook: '', linkedin: '', other: '' },
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = methods;

  const [startDate, setStartDate] = useState(dateToString(new Date()));
  const [endDate, setEndDate] = useState(dateToString(new Date()));
  const [isMultipleDates, setIsMultipleDates] = useState(false);
  const [isTeamEvent, setIsTeamEvent] = useState(false);
  const [hasFemaleQuota, setHasFemaleQuota] = useState(false);
  const [parentId, setParentId] = useState<number>(-1);
  const [showParent, setShowParent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [success, setSuccess] = useState(false);

  const eventState = watch('state');
  const eventType = watch('event_type');
  const isExternal = watch('registration_type') === 'EXTERNAL';
  const feedbackEnabled = watch('is_feedback_enabled') ?? false;
  const moreDetailsEnabled = watch('more_details_enabled') ?? false;
  const submissionEnabled = watch('is_submission_enabled') ?? false;

  useEffect(() => {
    if (!id) return;
    axios.request({
      baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
      url: '/api/v1' + `/event/p/get/${id}`,
      method: 'POST',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
    }).then((response) => {
      if (!response.data.event.organizer_id || !userData?.id ||
        response.data.event.organizer_id !== parseInt(`${userData?.id}`)) navigate('/');
      setEvent(response.data.event);
      methods.reset(response.data.event);
      setStartDate(dateToString(new Date(response.data.event.dates[0])));
      if (response.data.event.dates.length > 1) {
        setEndDate(dateToString(new Date(response.data.event.dates[response.data.event.dates.length - 1])));
        setIsMultipleDates(true);
      }
      if (response.data.event.parent_id) { setParentId(response.data.event.parent_id); setShowParent(true); }
      if (response.data.event.urls) {
        setValue('urls.instagram', response.data.event.urls.instagram || '');
        setValue('urls.facebook', response.data.event.urls.facebook || '');
        setValue('urls.linkedin', response.data.event.urls.linkedin || '');
        setValue('urls.other', response.data.event.urls.other || '');
      }
      if (response.data.event.ma_ppt > 1) {
        setValue('ma_ppt', response.data.event.ma_ppt);
        setValue('min_ppt', response.data.event.min_ppt);
        setIsTeamEvent(true);
      } else { setValue('ma_ppt', 1); setValue('min_ppt', 1); }
      if (response.data.event.female_requirement) setHasFemaleQuota(true);
      setValue('is_ticket_feature_enabled', response.data.event.is_ticket_feature_enabled);
    });
  }, [id]);

  function getDates(start: Date | null, end: Date | null) {
    const arr: Date[] = [];
    if (!start || !end) return arr;
    const cur = new Date(start);
    while (cur <= end) { arr.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
    arr.push(end);
    return arr;
  }

  useEffect(() => {
    if (!isMultipleDates) { setValue('dates', [new Date(startDate)]); return; }
    setValue('dates', getDates(new Date(startDate), new Date(endDate)));
  }, [startDate, endDate, isMultipleDates]);

  useEffect(() => {
    if (!isTeamEvent) { setValue('ma_ppt', 1); setValue('min_ppt', 1); }
  }, [isTeamEvent]);

  useEffect(() => {
    if (!hasFemaleQuota) setValue('female_requirement', null);
  }, [hasFemaleQuota]);

  const onSubmit = async (data: NewEventSchema) => {
    data.logo_image_url = data.event_page_image_url;
    // @ts-expect-error legacy field
    delete data.tickets_sold;
    if (data.parent_id === -1 || !showParent) data.parent_id = null;
    try {
      setLoading(true);
      const endpoint = id ? `/event/p/update/${id}` : '/event/p/create';
      await axios.post(import.meta.env.VITE_APP_SERVER_ADDRESS + '/api/v1' + endpoint, data, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      setSuccess(true);
      refreshEventsData();
    } catch { setSuccess(false); }
    setLoading(false);
    setShowAlert(true);
    setTimeout(() => { setShowAlert(false); navigate('/'); }, 2000);
  };

  if (id && !event) return <Loader />;

  const totalSteps = 6;
  const watchedName = watch('name');
  const watchedFee = watch('fee');
  const watchedTickets = watch('ticket_count');
  const watchedVenue = watch('venue');
  const watchedType = watch('event_type');
  const watchedRegType = watch('registration_type');

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-[#080808] flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0a0a0a]">
          <div>
            <h1 className="text-white font-marcellus text-xl">{id ? 'Edit Event' : 'New Event'}</h1>
            <p className="text-zinc-500 text-xs font-fira mt-0.5">Step {step} of {totalSteps} — {STEPS[step - 1].label}</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/')} className="px-4 py-2 text-sm font-fira text-zinc-400 hover:text-zinc-200 transition-colors">
              Cancel
            </button>
            {step < totalSteps && (
              <button type="button" onClick={() => setStep((s) => s + 1)} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-fira font-semibold rounded-lg transition-colors">
                Continue →
              </button>
            )}
            {step === totalSteps && (
              <button type="button" onClick={handleSubmit(onSubmit)} disabled={loading}
                className={`px-5 py-2 text-white text-sm font-fira font-semibold rounded-lg transition-colors flex items-center gap-2 ${loading ? 'bg-red-700/50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>
                {loading ? <Spinner /> : id ? 'Update Event' : 'Create Event'}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Step sidebar */}
          <div className="w-56 shrink-0 bg-[#0a0a0a] border-r border-white/5 py-6 px-4">
            <div className="flex flex-col gap-1">
              {STEPS.map((s) => {
                const done = step > s.id;
                const active = step === s.id;
                return (
                  <button key={s.id} type="button" onClick={() => setStep(s.id)}
                    className={`flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all ${active ? 'bg-red-600/10 border border-red-600/20' : 'hover:bg-white/5 border border-transparent'}`}>
                    <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-fira font-semibold mt-0.5 ${done ? 'bg-red-600 text-white' : active ? 'bg-red-600/20 border border-red-600/50 text-red-400' : 'bg-zinc-800 text-zinc-500 border border-white/5'}`}>
                      {done ? '✓' : s.id}
                    </div>
                    <div>
                      <p className={`text-sm font-fira font-medium leading-tight ${active ? 'text-white' : done ? 'text-zinc-300' : 'text-zinc-500'}`}>{s.label}</p>
                      <p className="text-zinc-600 text-[10px] font-fira mt-0.5">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto px-10 py-8">
            <form onSubmit={handleSubmit(onSubmit)}>

              {/* ── STEP 1: Basics ── */}
              {step === 1 && (
                <div className="max-w-2xl space-y-6">
                  <div>
                    <h2 className="text-white font-marcellus text-lg mb-1">Basic Information</h2>
                    <p className="text-zinc-500 text-sm font-fira">The core identity of your event shown across the platform.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className={FIELD}>
                      <label className={LABEL}>Event Name <span className="text-red-500">*</span></label>
                      <input className={INPUT} {...register('name')} placeholder="e.g. HackSphere 2026" />
                      <p className={ERROR}>{errors.name?.message}</p>
                    </div>
                    <div className={FIELD}>
                      <label className={LABEL}>Tagline <span className="text-red-500">*</span></label>
                      <input className={INPUT} {...register('tag_line')} placeholder="e.g. Code. Create. Conquer." />
                      <p className={ERROR}>{errors.tag_line?.message}</p>
                    </div>
                  </div>

                  <div className={FIELD}>
                    <label className={LABEL}>Short Description <span className="text-red-500">*</span></label>
                    <textarea rows={3} className={`${INPUT} resize-none`} {...register('description')} placeholder="2–3 lines shown on event cards and search results." />
                    <p className="text-zinc-600 text-[10px] font-fira mt-1">Max 1000 characters</p>
                    <p className={ERROR}>{errors.description?.message}</p>
                  </div>

                  <div className={FIELD}>
                    <label className={LABEL}>Full Description <span className="text-red-500">*</span></label>
                    <textarea rows={6} className={`${INPUT} resize-none`} {...register('long_description')} placeholder="Detailed overview of the event — what it's about, who should attend, prizes, schedule etc." />
                    <p className="text-zinc-600 text-[10px] font-fira mt-1">Max 5000 characters. Supports basic formatting in the student app.</p>
                    <p className={ERROR}>{errors.long_description?.message}</p>
                  </div>

                  <div className="space-y-3">
                    <SectionTitle title="Event Images" desc="Used across different surfaces in the student and council portals." />
                    <div className="grid grid-cols-2 gap-5">
                      <div className={FIELD}>
                        <label className={LABEL}>Detail Page Image <span className="text-red-500">*</span></label>
                        <input className={INPUT} {...register('event_page_image_url')} placeholder="https://..." />
                        <p className="text-zinc-600 text-[10px] font-fira mt-1">1:1 square — shown on the event detail page</p>
                        <p className={ERROR}>{errors.event_page_image_url?.message}</p>
                      </div>
                      <div className={FIELD}>
                        <label className={LABEL}>Banner / Card Image <span className="text-red-500">*</span></label>
                        <input className={INPUT} {...register('banner_url')} placeholder="https://..." />
                        <p className="text-zinc-600 text-[10px] font-fira mt-1">16:9 landscape — used in trending cards and listings</p>
                        <p className={ERROR}>{errors.banner_url?.message}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>Hierarchy</label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      {[
                        { val: false, label: 'Main Event', desc: 'Standalone top-level event' },
                        { val: true, label: 'Sub Event', desc: 'Nested under a parent event (e.g. a round or workshop within a fest)' },
                      ].map((opt) => (
                        <button key={String(opt.val)} type="button" onClick={() => setShowParent(opt.val)}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${showParent === opt.val ? 'border-red-600/40 bg-red-600/10' : 'border-white/[0.06] bg-[#0d0d0d] hover:border-white/15'}`}>
                          <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${showParent === opt.val ? 'border-red-500' : 'border-zinc-600'}`}>
                            {showParent === opt.val && <div className="w-2 h-2 rounded-full bg-red-500" />}
                          </div>
                          <div>
                            <p className="text-white text-sm font-fira font-medium">{opt.label}</p>
                            <p className="text-zinc-500 text-xs font-fira mt-0.5">{opt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {showParent && (
                    <div className={FIELD}>
                      <label className={LABEL}>Parent Event <span className="text-red-500">*</span></label>
                      <select className={INPUT} {...register('parent_id')} value={parentId} onChange={(e) => setParentId(parseInt(e.target.value))}>
                        <option value="-1" disabled>Select parent event…</option>
                        {events.filter((e) => e.id !== event?.id).map((ev) => (
                          <option key={ev.id} value={ev.id}>{ev.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 2: Schedule ── */}
              {step === 2 && (
                <div className="max-w-2xl space-y-6">
                  <div>
                    <h2 className="text-white font-marcellus text-lg mb-1">Schedule & Venue</h2>
                    <p className="text-zinc-500 text-sm font-fira">When and where the event takes place.</p>
                  </div>

                  <div>
                    <label className={LABEL}>Event Type <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-3 gap-3 mt-1">
                      {[
                        { val: 'COMPETETION', label: 'Competition', icon: '🏆' },
                        { val: 'WORKSHOP',    label: 'Workshop',    icon: '🔧' },
                        { val: 'SPEAKER_SESSION', label: 'Speaker Session', icon: '🎤' },
                        { val: 'ONLINE',      label: 'Online',      icon: '💻' },
                        { val: 'FEST',        label: 'Fest',        icon: '🎪' },
                      ].map((opt) => {
                        const cur = watch('event_type');
                        return (
                          <button key={opt.val} type="button" onClick={() => setValue('event_type', opt.val as NewEventSchema['event_type'])}
                            className={`py-3 px-3 rounded-lg border text-sm font-fira text-center transition-all flex flex-col items-center gap-1 ${cur === opt.val ? 'border-red-600/40 bg-red-600/10 text-white' : 'border-white/[0.06] bg-[#0d0d0d] text-zinc-400 hover:border-white/15'}`}>
                            <span className="text-xl">{opt.icon}</span>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className={ERROR}>{errors.event_type?.message}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className={FIELD}>
                      <label className={LABEL}>{isMultipleDates ? 'Start Date & Time' : 'Event Date & Time'} <span className="text-red-500">*</span></label>
                      <input type="datetime-local" className={INPUT} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    {isMultipleDates ? (
                      <div className={FIELD}>
                        <label className={LABEL}>End Date & Time <span className="text-red-500">*</span></label>
                        <input type="datetime-local" className={INPUT} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        <p className={ERROR}>{errors.dates?.message}</p>
                      </div>
                    ) : <div />}
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <Toggle on={isMultipleDates} onToggle={() => setIsMultipleDates(!isMultipleDates)} />
                    <div>
                      <p className="text-zinc-300 text-sm font-fira">Multi-day event</p>
                      <p className="text-zinc-600 text-xs font-fira">Spans across more than one calendar day</p>
                    </div>
                  </label>

                  <div className={FIELD}>
                    <label className={LABEL}>{eventType === 'ONLINE' ? 'Online Meeting Link' : 'Venue'} <span className="text-red-500">*</span></label>
                    <input className={INPUT}
                      {...register(eventType === 'ONLINE' ? 'online_event_link' : 'venue')}
                      placeholder={eventType === 'ONLINE' ? 'https://meet.google.com/xxx-xxxx-xxx' : 'e.g. KJSCE Auditorium, Vidyavihar, Mumbai'} />
                    <p className={ERROR}>{eventType === 'ONLINE' ? errors.online_event_link?.message : errors.venue?.message}</p>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Registration ── */}
              {step === 3 && (
                <div className="max-w-2xl space-y-6">
                  <div>
                    <h2 className="text-white font-marcellus text-lg mb-1">Registration & Tickets</h2>
                    <p className="text-zinc-500 text-sm font-fira">How students sign up and what it costs them.</p>
                  </div>

                  {/* Registration mode */}
                  <div>
                    <label className={LABEL}>Registration Mode</label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      {[
                        { val: 'ONPLATFORM', label: 'On-Platform', desc: 'Registrations handled through Eventio — you get a dashboard with all participants' },
                        { val: 'EXTERNAL',   label: 'External Form', desc: 'Redirect students to a Google Form, Unstop, Devfolio or any other link' },
                      ].map((opt) => {
                        const cur = watch('registration_type');
                        return (
                          <button key={opt.val} type="button" onClick={() => setValue('registration_type', opt.val as NewEventSchema['registration_type'])}
                            className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${cur === opt.val ? 'border-red-600/40 bg-red-600/10' : 'border-white/[0.06] bg-[#0d0d0d] hover:border-white/15'}`}>
                            <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${cur === opt.val ? 'border-red-500' : 'border-zinc-600'}`}>
                              {cur === opt.val && <div className="w-2 h-2 rounded-full bg-red-500" />}
                            </div>
                            <div>
                              <p className="text-white text-sm font-fira font-medium">{opt.label}</p>
                              <p className="text-zinc-500 text-xs font-fira mt-0.5">{opt.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {isExternal ? (
                    <div className={FIELD}>
                      <label className={LABEL}>External Registration Link <span className="text-red-500">*</span></label>
                      <input className={INPUT} {...register('external_registration_link')} placeholder="https://unstop.com/p/your-event" />
                      <p className={ERROR}>{errors.external_registration_link?.message}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-5">
                      <div className={FIELD}>
                        <label className={LABEL}>Total Seats / Ticket Count <span className="text-red-500">*</span></label>
                        <input type="number" min={1} className={INPUT} {...register('ticket_count')} placeholder="e.g. 300" defaultValue={500} />
                        <p className="text-zinc-600 text-[10px] font-fira mt-1">Registration closes when seats are full</p>
                        <p className={ERROR}>{errors.ticket_count?.message}</p>
                      </div>
                      <div className={FIELD}>
                        <label className={LABEL}>Entry Fee (₹) <span className="text-red-500">*</span></label>
                        <input type="number" min={0} className={INPUT} {...register('fee')} placeholder="0 for free" />
                        <p className="text-zinc-600 text-[10px] font-fira mt-1">Set to 0 for a free event</p>
                        <p className={ERROR}>{errors.fee?.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Female quota */}
                  <div className={SECTION}>
                    <div className="flex items-center justify-between">
                      <SectionTitle title="Female Seat Reservation" desc="Reserve a fixed number of seats exclusively for female participants." />
                      <Toggle on={hasFemaleQuota} onToggle={() => setHasFemaleQuota(!hasFemaleQuota)} />
                    </div>
                    {hasFemaleQuota && (
                      <div className={FIELD}>
                        <label className={LABEL}>Reserved Female Seats</label>
                        <input type="number" min={0} className={INPUT} {...register('female_requirement')} placeholder="e.g. 50" />
                        <p className="text-zinc-600 text-[10px] font-fira mt-1">These seats are only open to female students</p>
                        <p className={ERROR}>{errors.female_requirement?.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Team event */}
                  <div className={SECTION}>
                    <div className="flex items-center justify-between">
                      <SectionTitle title="Team Participation" desc="Allow students to register as a group rather than individually." />
                      <Toggle on={isTeamEvent} onToggle={() => setIsTeamEvent(!isTeamEvent)} />
                    </div>
                    {isTeamEvent && (
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                        <div className={FIELD}>
                          <label className={LABEL}>Min Members per Team</label>
                          <input type="number" min={1} className={INPUT} {...register('min_ppt')} placeholder="e.g. 2" />
                          <p className={ERROR}>{errors.min_ppt?.message}</p>
                        </div>
                        <div className={FIELD}>
                          <label className={LABEL}>Max Members per Team</label>
                          <input type="number" min={1} className={INPUT} {...register('ma_ppt')} placeholder="e.g. 5" />
                          <p className={ERROR}>{errors.ma_ppt?.message}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Access control */}
                  <div className={SECTION}>
                    <SectionTitle title="Access Control" desc="Who can register for this event." />
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input type="checkbox" className="accent-red-600 w-4 h-4" {...register('is_only_somaiya')} />
                      <div>
                        <p className="text-zinc-300 text-sm font-fira">Somaiya Students Only</p>
                        <p className="text-zinc-600 text-xs font-fira">Restrict registrations to KJ Somaiya College students exclusively</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* ── STEP 4: Features ── */}
              {step === 4 && (
                <div className="max-w-2xl space-y-6">
                  <div>
                    <h2 className="text-white font-marcellus text-lg mb-1">Event Features</h2>
                    <p className="text-zinc-500 text-sm font-fira">Configure advanced capabilities for your event.</p>
                  </div>

                  {/* Attendance tracking */}
                  <div className={SECTION}>
                    <SectionTitle title="Attendance Tracking" desc="How participant attendance is recorded on the day of the event." />
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: null,     label: 'None',   desc: 'No in-app attendance tracking' },
                        { val: 'TICKET', label: 'Ticket Scan', desc: 'QR code scan at the gate' },
                        { val: 'BLE',    label: 'BLE Beacon', desc: 'Automatic via Bluetooth proximity' },
                      ].map((opt) => {
                        const cur = watch('attendance_type');
                        const isSelected = cur === opt.val;
                        return (
                          <button key={String(opt.val)} type="button"
                            onClick={() => setValue('attendance_type', opt.val as NewEventSchema['attendance_type'])}
                            className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${isSelected ? 'border-red-600/40 bg-red-600/10' : 'border-white/[0.06] bg-[#0d0d0d] hover:border-white/15'}`}>
                            <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${isSelected ? 'border-red-500' : 'border-zinc-600'}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-red-500" />}
                            </div>
                            <div>
                              <p className="text-white text-sm font-fira font-medium">{opt.label}</p>
                              <p className="text-zinc-500 text-xs font-fira mt-0.5">{opt.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Post-event feedback */}
                  <div className={SECTION}>
                    <div className="flex items-center justify-between">
                      <SectionTitle title="Post-Event Feedback" desc="Send an in-app feedback form to participants after the event ends." />
                      <Toggle on={feedbackEnabled} onToggle={() => setValue('is_feedback_enabled', !feedbackEnabled)} />
                    </div>
                    {feedbackEnabled && (
                      <p className="text-zinc-500 text-xs font-fira bg-zinc-800/50 rounded-lg px-3 py-2 border border-white/5">
                        Participants will receive a feedback prompt in the Eventio app once the event is marked Completed.
                      </p>
                    )}
                  </div>

                  {/* In-event activity */}
                  <div className={SECTION}>
                    <SectionTitle title="In-Event Live Activity" desc="Link a live activity (quiz, poll, leaderboard) that opens during the event." />
                    <div className={FIELD}>
                      <label className={LABEL}>Activity Link</label>
                      <input className={INPUT} {...register('in_event_activity')} placeholder="https://quiz.example.com/live/..." />
                      <p className={ERROR}>{errors.in_event_activity?.message}</p>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input type="checkbox" className="accent-red-600 w-4 h-4" {...register('start_in_event_activity')} />
                      <div>
                        <p className="text-zinc-300 text-sm font-fira">Auto-launch when event goes Ongoing</p>
                        <p className="text-zinc-600 text-xs font-fira">The activity link is pushed to registered participants automatically</p>
                      </div>
                    </label>
                  </div>

                  {/* Project submissions */}
                  <div className={SECTION}>
                    <div className="flex items-center justify-between">
                      <SectionTitle title="Project / File Submissions" desc="Allow teams or participants to submit files, repos or links inside the app." />
                      <Toggle on={submissionEnabled} onToggle={() => setValue('is_submission_enabled', !submissionEnabled)} />
                    </div>
                    {submissionEnabled && (
                      <p className="text-zinc-500 text-xs font-fira bg-zinc-800/50 rounded-lg px-3 py-2 border border-white/5">
                        A submission portal will appear for registered participants during the ONGOING phase. Useful for hackathons and competitions.
                      </p>
                    )}
                  </div>

                  {/* More details form */}
                  <div className={SECTION}>
                    <div className="flex items-center justify-between">
                      <SectionTitle title="Extra Registration Fields" desc="Collect additional info from participants beyond name, email and roll number." />
                      <Toggle on={moreDetailsEnabled} onToggle={() => setValue('more_details_enabled', !moreDetailsEnabled)} />
                    </div>
                    {moreDetailsEnabled && (
                      <p className="text-zinc-500 text-xs font-fira bg-zinc-800/50 rounded-lg px-3 py-2 border border-white/5">
                        Custom form fields are configured after the event is approved. Useful for collecting T-shirt size, dietary preferences, GitHub handles etc.
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div className={FIELD}>
                    <label className={LABEL}>Tags</label>
                    <input className={INPUT} {...register('tags')} placeholder="Hackathon, AI, Web Dev  (max 5, comma-separated)" />
                    <p className="text-zinc-600 text-[10px] font-fira mt-1">Helps students discover your event through search and filters</p>
                    <p className={ERROR}>{errors.tags?.message}</p>
                  </div>
                </div>
              )}

              {/* ── STEP 5: Media & Links ── */}
              {step === 5 && (
                <div className="max-w-2xl space-y-6">
                  <div>
                    <h2 className="text-white font-marcellus text-lg mb-1">Media & Links</h2>
                    <p className="text-zinc-500 text-sm font-fira">Help students find out more and follow your event online.</p>
                  </div>

                  <div className={SECTION}>
                    <SectionTitle title="Social Media Handles" desc="Links shown on the event page so students can follow for updates." />
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: 'urls.instagram' as const, label: 'Instagram', ph: 'https://instagram.com/your-council' },
                        { key: 'urls.facebook' as const, label: 'Facebook', ph: 'https://facebook.com/your-council' },
                        { key: 'urls.linkedin' as const, label: 'LinkedIn', ph: 'https://linkedin.com/company/your-council' },
                        { key: 'urls.other' as const, label: 'Website / Other', ph: 'https://your-event-website.com' },
                      ].map((f) => (
                        <div key={f.key} className={FIELD}>
                          <label className={LABEL}>{f.label}</label>
                          <input className={INPUT} {...register(f.key)} placeholder={f.ph} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={SECTION}>
                    <SectionTitle title="Post-Event Report" desc="Upload a report URL after the event is completed for Dean's review." />
                    <div className={FIELD}>
                      <label className={LABEL}>Report URL</label>
                      <input className={INPUT} {...register('report_url')} placeholder="https://drive.google.com/..." />
                      <p className="text-zinc-600 text-[10px] font-fira mt-1">Can be added or updated after the event ends</p>
                      <p className={ERROR}>{errors.report_url?.message}</p>
                    </div>
                  </div>

                  {/* Status — visible in edit mode on this step */}
                  {id && (
                    <div className={SECTION}>
                      <SectionTitle title="Event Status" desc="Move the event through its lifecycle." />
                      <div className={FIELD}>
                        <label className={LABEL}>Current Status</label>
                        <select className={INPUT} {...register('state')}>
                          {eventState === 'DRAFT' || eventState === 'APPLIED_FOR_APPROVAL' ? (
                            <>
                              <option value="DRAFT">Draft — not submitted</option>
                              <option value="APPLIED_FOR_APPROVAL">Applied for Approval — awaiting Dean</option>
                            </>
                          ) : (
                            <>
                              <option value="UNLISTED">Unlisted</option>
                              <option value="UPCOMING">Upcoming</option>
                              <option value="REGISTRATION_OPEN">Registration Open</option>
                              <option value="REGISTRATION_CLOSED">Registration Closed</option>
                              <option value="TICKET_OPEN">Ticket Open</option>
                              <option value="TICKET_CLOSED">Ticket Closed</option>
                              <option value="ONGOING">Ongoing</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="PRIVATE">Private</option>
                            </>
                          )}
                        </select>
                        <p className={ERROR}>{errors.state?.message}</p>
                      </div>
                      {event?.comment && (
                        <div className="bg-red-950/30 border border-red-600/20 rounded-lg p-3">
                          <p className="text-zinc-400 text-xs font-fira mb-1 uppercase tracking-wider">Dean's Comment</p>
                          <p className="text-red-400 text-sm font-fira">{event.comment}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 6: Review ── */}
              {step === 6 && (
                <div className="max-w-2xl space-y-6">
                  <div>
                    <h2 className="text-white font-marcellus text-lg mb-1">Review Before {id ? 'Updating' : 'Submitting'}</h2>
                    <p className="text-zinc-500 text-sm font-fira">Double-check everything. You can click any step in the sidebar to go back and edit.</p>
                  </div>

                  {/* Summary cards */}
                  <div className="space-y-3">
                    <ReviewRow label="Event Name" value={watchedName || '—'} step={1} onJump={setStep} />
                    <ReviewRow label="Event Type" value={watchedType?.replace(/_/g, ' ') || '—'} step={2} onJump={setStep} />
                    <ReviewRow label="Venue / Link" value={watchedVenue || watch('online_event_link') || '—'} step={2} onJump={setStep} />
                    <ReviewRow label="Date(s)" value={isMultipleDates ? `${startDate} → ${endDate}` : startDate} step={2} onJump={setStep} />
                    <ReviewRow label="Registration" value={watchedRegType === 'EXTERNAL' ? 'External Form' : `On-Platform · ${watchedTickets ?? '—'} seats`} step={3} onJump={setStep} />
                    <ReviewRow label="Entry Fee" value={watchedFee === 0 ? 'Free' : `₹${watchedFee}`} step={3} onJump={setStep} />
                    <ReviewRow label="Team Event" value={isTeamEvent ? `Yes · ${watch('min_ppt')}–${watch('ma_ppt')} members` : 'Individual'} step={3} onJump={setStep} />
                    <ReviewRow label="Female Seats" value={hasFemaleQuota ? `${watch('female_requirement') ?? 0} reserved` : 'None'} step={3} onJump={setStep} />
                    <ReviewRow label="Somaiya Only" value={watch('is_only_somaiya') ? 'Yes' : 'No'} step={3} onJump={setStep} />
                    <ReviewRow label="Attendance" value={watch('attendance_type') || 'Not set'} step={4} onJump={setStep} />
                    <ReviewRow label="Submissions" value={submissionEnabled ? 'Enabled' : 'Disabled'} step={4} onJump={setStep} />
                    <ReviewRow label="Feedback" value={feedbackEnabled ? 'Enabled' : 'Disabled'} step={4} onJump={setStep} />
                    <ReviewRow label="Extra Fields" value={moreDetailsEnabled ? 'Enabled' : 'Disabled'} step={4} onJump={setStep} />
                  </div>

                  {!id && (
                    <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4">
                      <p className="text-zinc-400 text-xs font-fira leading-relaxed">
                        After creating, the event will be saved as a <span className="text-white font-semibold">Draft</span>. You can then edit and submit it for Dean's approval when ready. Approved events are published to the student app.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom nav */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
                <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}
                  className="px-5 py-2.5 text-sm font-fira text-zinc-400 hover:text-zinc-200 border border-white/10 hover:border-white/20 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  ← Back
                </button>
                {step < totalSteps ? (
                  <button type="button" onClick={() => setStep((s) => s + 1)}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-fira font-semibold rounded-lg transition-colors">
                    Continue →
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit(onSubmit)} disabled={loading}
                    className={`px-6 py-2.5 text-white text-sm font-fira font-semibold rounded-lg transition-colors flex items-center gap-2 ${loading ? 'bg-red-700/50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>
                    {loading ? <Spinner /> : id ? 'Update Event' : 'Create Event'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {showAlert && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-fira shadow-2xl border ${success ? 'bg-green-900/90 border-green-600/30 text-green-300' : 'bg-red-900/90 border-red-600/30 text-red-300'}`}>
            {success ? (id ? 'Event updated!' : 'Event created as Draft!') : 'Failed to save event.'}
          </div>
        )}
      </div>
    </FormProvider>
  );
}

function ReviewRow({ label, value, step, onJump }: { label: string; value: string; step: number; onJump: (s: number) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-4 bg-[#0d0d0d] border border-white/[0.06] rounded-lg">
      <span className="text-zinc-500 text-xs font-fira uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-white text-sm font-fira">{value}</span>
        <button type="button" onClick={() => onJump(step)} className="text-zinc-600 hover:text-red-400 text-xs font-fira transition-colors">Edit</button>
      </div>
    </div>
  );
}
