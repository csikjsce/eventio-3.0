import { useState, useContext, useMemo, useCallback } from 'react';
import EventsDataContext from '../contexts/EventsDataContext';
import { Search, Check, Download, ScanLine, Camera, CameraOff, KeyboardIcon, ArrowLeft, ChevronRight, CalendarDays, MapPin, Users } from 'lucide-react';
import { Scanner, type IDetectedBarcode } from '@yudiel/react-qr-scanner';

interface AttendeeRow {
  id: number;
  name: string;
  roll: string;
  branch: string;
  year: string;
  attended: boolean;
}

const MOCK_ATTENDEES: AttendeeRow[] = [
  { id: 1, name: 'Aanya Sharma', roll: '21COMP001', branch: 'COMP', year: 'SY', attended: false },
  { id: 2, name: 'Rohan Mehta', roll: '21COMP002', branch: 'COMP', year: 'SY', attended: false },
  { id: 3, name: 'Priya Nair', roll: '21IT001', branch: 'IT', year: 'TY', attended: false },
  { id: 4, name: 'Dev Patel', roll: '22AIDS001', branch: 'AIDS', year: 'FY', attended: false },
  { id: 5, name: 'Sneha Kulkarni', roll: '21EXTC001', branch: 'EXTC', year: 'TY', attended: false },
  { id: 6, name: 'Arjun Singh', roll: '20COMP001', branch: 'COMP', year: 'LY', attended: false },
  { id: 7, name: 'Meera Joshi', roll: '21MECH001', branch: 'Mech', year: 'SY', attended: false },
  { id: 8, name: 'Karan Verma', roll: '22IT001', branch: 'IT', year: 'FY', attended: false },
  { id: 9, name: 'Isha Desai', roll: '21AIDS001', branch: 'AIDS', year: 'SY', attended: false },
  { id: 10, name: 'Vivek Rao', roll: '21EXTC002', branch: 'EXTC', year: 'TY', attended: false },
];

export default function Attendance() {
  const { eventsList } = useContext(EventsDataContext);
  const allEvents = Object.values(eventsList).flat();
  const activeEvents = allEvents.filter(e => ['ONGOING', 'UPCOMING', 'REGISTRATION_OPEN'].includes(e.state));

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [attendees, setAttendees] = useState<AttendeeRow[]>(MOCK_ATTENDEES);
  const [search, setSearch] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [scanMessage, setScanMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [saved, setSaved] = useState(false);
  const [scanMode, setScanMode] = useState<'manual' | 'camera'>('manual');
  const [cameraActive, setCameraActive] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const filtered = useMemo(() =>
    attendees.filter(a =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.roll.toLowerCase().includes(search.toLowerCase())
    ), [attendees, search]);

  const presentCount = attendees.filter(a => a.attended).length;

  function toggle(id: number) {
    setAttendees(prev => prev.map(a => a.id === id ? { ...a, attended: !a.attended } : a));
    setSaved(false);
  }

  function markAll(val: boolean) {
    setAttendees(prev => prev.map(a => ({ ...a, attended: val })));
    setSaved(false);
  }

  function markRoll(rawRoll: string) {
    const roll = rawRoll.trim().toUpperCase();
    if (!roll) return;
    const found = attendees.find(a => a.roll.toUpperCase() === roll);
    if (!found) {
      setScanMessage({ text: `Roll no "${roll}" not found in this event.`, ok: false });
    } else if (found.attended) {
      setScanMessage({ text: `${found.name} already marked present.`, ok: false });
    } else {
      setAttendees(prev => prev.map(a => a.roll.toUpperCase() === roll ? { ...a, attended: true } : a));
      setScanMessage({ text: `✓ ${found.name} (${found.roll}) marked present!`, ok: true });
      setSaved(false);
    }
    setTimeout(() => setScanMessage(null), 3000);
  }

  function handleScan() {
    markRoll(scanInput);
    setScanInput('');
  }

  const handleCameraScan = useCallback((results: IDetectedBarcode[]) => {
    const raw = results[0]?.rawValue;
    if (!raw || raw === lastScanned) return;
    setLastScanned(raw);
    markRoll(raw);
    // debounce: clear lastScanned after 2s so same QR can be re-scanned
    setTimeout(() => setLastScanned(null), 2000);
  }, [attendees, lastScanned]);

  function handleSave() {
    setSaved(true);
  }

  function exportCSV() {
    const rows = [
      ['Name', 'Roll No', 'Branch', 'Year', 'Attended'],
      ...attendees.map(a => [a.name, a.roll, a.branch, a.year, a.attended ? 'Yes' : 'No']),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'attendance.csv';
    document.body.appendChild(a); a.click();
    a.remove(); URL.revokeObjectURL(url);
  }

  const STATE_BADGE: Record<string, string> = {
    ONGOING:           'bg-emerald-500/10 text-emerald-400',
    UPCOMING:          'bg-amber-500/10 text-amber-400',
    REGISTRATION_OPEN: 'bg-blue-500/10 text-blue-400',
  };

  // ── Event picker view ───────────────────────────────────────────────────────
  if (selectedEventId === null) {
    return (
      <div className="min-h-screen bg-[#121214] px-8 py-8">
        <div className="mb-8">
          <h1 className="text-white font-marcellus text-2xl mb-1">Attendance</h1>
          <p className="text-zinc-500 text-sm font-fira">Select an active event to mark or scan attendance.</p>
        </div>

        {activeEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users size={40} className="text-zinc-700 mb-4" />
            <p className="text-zinc-400 font-fira text-sm">No active events right now.</p>
            <p className="text-zinc-600 font-fira text-xs mt-1">Events in Ongoing, Upcoming or Registration Open state will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEvents.map(ev => {
              const date = ev.dates?.[0]
                ? new Date(ev.dates[0]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—';
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => { setSelectedEventId(ev.id); setAttendees(MOCK_ATTENDEES.map(a => ({ ...a, attended: false }))); setSaved(false); }}
                  className="bg-[#1c1c1e] border border-white/[0.06] hover:border-red-600/30 rounded-xl p-5 text-left transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-fira uppercase tracking-widest px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">{ev.event_type}</span>
                    <span className={`text-[10px] font-fira uppercase tracking-widest px-2 py-0.5 rounded-md ${STATE_BADGE[ev.state] ?? 'bg-zinc-800 text-zinc-500'}`}>{ev.state.replace(/_/g,' ')}</span>
                  </div>
                  <h3 className="text-white font-fira font-semibold text-sm leading-snug mb-1 group-hover:text-red-400 transition-colors">{ev.name}</h3>
                  <p className="text-zinc-600 text-xs font-fira mb-4 line-clamp-1">{ev.tag_line}</p>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-fira">
                      <CalendarDays size={11} />{date}
                    </div>
                    {ev.venue && (
                      <div className="flex items-center gap-2 text-zinc-500 text-xs font-fira">
                        <MapPin size={11} />{ev.venue}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                    <span className="text-zinc-500 text-xs font-fira">Mark attendance</span>
                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-red-400 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Detail view ──────────────────────────────────────────────────────────────
  const selectedEvent = activeEvents.find(e => e.id === selectedEventId);

  return (
    <div className="min-h-screen bg-[#121214] px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setSelectedEventId(null)}
            className="w-8 h-8 rounded-lg bg-[#1c1c1e] border border-white/[0.06] hover:border-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition-all">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-white font-marcellus text-2xl mb-0.5">{selectedEvent?.name}</h1>
            <p className="text-zinc-500 text-sm font-fira">Attendance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#1c1c1e] border border-white/[0.06] hover:border-white/15 text-zinc-400 hover:text-white text-xs font-fira rounded-lg transition-all">
            <Download size={13} /> Export
          </button>
          <button type="button" onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 border text-xs font-fira rounded-lg transition-all ${
              saved ? 'bg-emerald-600/20 border-emerald-600/30 text-emerald-400' : 'bg-red-600 border-red-600 text-white hover:bg-red-700'
            }`}>
            <Check size={13} /> {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Scan + stats */}
          <div className="space-y-4">
            {/* Scanner input */}
            <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl overflow-hidden">
              {/* Mode tab bar */}
              <div className="flex border-b border-white/[0.06]">
                {([['manual', KeyboardIcon, 'Manual / Roll No'], ['camera', Camera, 'Camera QR']] as const).map(([mode, Icon, label]) => (
                  <button key={mode} type="button"
                    onClick={() => { setScanMode(mode); if (mode !== 'camera') setCameraActive(false); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-fira transition-all ${
                      scanMode === mode
                        ? 'text-red-400 bg-red-600/10 border-b-2 border-red-600'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}>
                    <Icon size={13} />{label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {scanMode === 'manual' ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <ScanLine size={16} className="text-red-500" />
                      <h3 className="text-white font-fira font-semibold text-sm">Enter Roll No</h3>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 21COMP001"
                        value={scanInput}
                        onChange={e => setScanInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleScan()}
                        className="flex-1 bg-[#252527] border border-white/[0.06] focus:border-red-600/40 rounded-lg px-3 py-2 text-sm font-fira text-white placeholder-zinc-600 outline-none transition-colors"
                        autoFocus
                      />
                      <button type="button" onClick={handleScan}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-fira rounded-lg transition-colors">
                        Mark
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Camera size={16} className="text-red-500" />
                        <h3 className="text-white font-fira font-semibold text-sm">Camera QR Scanner</h3>
                      </div>
                      <button type="button"
                        onClick={() => setCameraActive(a => !a)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-fira border transition-all ${
                          cameraActive
                            ? 'bg-red-600/15 border-red-600/30 text-red-400'
                            : 'bg-[#252527] border-white/[0.06] text-zinc-400 hover:text-white'
                        }`}>
                        {cameraActive ? <><CameraOff size={12} /> Stop</> : <><Camera size={12} /> Start</>}
                      </button>
                    </div>

                    {cameraActive ? (
                      <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                        <Scanner
                          onScan={handleCameraScan}
                          allowMultiple={false}
                          scanDelay={800}
                          styles={{ container: { width: '100%', height: '100%' } }}
                          components={{ audio: false }}
                        />
                        {/* Scan overlay frame */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <div className="w-2/3 h-2/3 relative">
                            {[['top-0 left-0','border-t-2 border-l-2'],['top-0 right-0','border-t-2 border-r-2'],['bottom-0 left-0','border-b-2 border-l-2'],['bottom-0 right-0','border-b-2 border-r-2']].map(([pos, border]) => (
                              <span key={pos} className={`absolute w-6 h-6 ${pos} ${border} border-red-500 rounded-sm`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center aspect-square rounded-xl bg-[#252527] border border-dashed border-white/10 gap-3">
                        <Camera size={32} className="text-zinc-700" />
                        <p className="text-zinc-600 text-xs font-fira text-center">Press Start to<br/>activate camera</p>
                      </div>
                    )}
                  </>
                )}

                {scanMessage && (
                  <p className={`mt-3 text-xs font-fira px-3 py-2 rounded-lg ${
                    scanMessage.ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {scanMessage.text}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5 space-y-4">
              <h3 className="text-white font-fira font-semibold text-sm">Session Stats</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-zinc-500 text-xs font-fira">Present</span>
                    <span className="text-white text-sm font-fira font-bold">{presentCount}/{attendees.length}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${attendees.length > 0 ? (presentCount / attendees.length) * 100 : 0}%` }} />
                  </div>
                </div>
                <p className="text-white text-3xl font-fira font-bold">
                  {attendees.length > 0 ? Math.round((presentCount / attendees.length) * 100) : 0}%
                </p>
                <p className="text-zinc-500 text-xs font-fira">Show-up rate</p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex gap-2">
                <button type="button" onClick={() => markAll(true)}
                  className="flex-1 py-2 text-xs font-fira text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors">
                  Mark All Present
                </button>
                <button type="button" onClick={() => markAll(false)}
                  className="flex-1 py-2 text-xs font-fira text-zinc-500 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors">
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Right: Attendee list */}
          <div className="lg:col-span-2 bg-[#1c1c1e] border border-white/[0.06] rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search participants…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#252527] border border-white/[0.06] focus:border-red-600/40 rounded-lg pl-8 pr-3 py-2 text-sm font-fira text-white placeholder-zinc-600 outline-none transition-colors"
                />
              </div>
              <span className="text-zinc-600 text-xs font-fira shrink-0">{filtered.length} shown</span>
            </div>

            <div className="overflow-y-auto flex-1" style={{ maxHeight: '60vh' }}>
              <table className="w-full">
                <thead className="sticky top-0 bg-[#1c1c1e] z-10">
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-left px-5 py-3 text-zinc-500 text-[11px] font-fira font-normal uppercase tracking-wide">Participant</th>
                    <th className="text-left px-5 py-3 text-zinc-500 text-[11px] font-fira font-normal uppercase tracking-wide">Roll / Branch</th>
                    <th className="text-center px-5 py-3 text-zinc-500 text-[11px] font-fira font-normal uppercase tracking-wide">Present</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} className={`border-b border-white/[0.03] transition-colors last:border-0 ${a.attended ? 'bg-emerald-500/[0.03]' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-[11px] font-bold font-fira shrink-0">
                            {a.name[0]}
                          </div>
                          <div>
                            <p className="text-white text-sm font-fira font-semibold">{a.name}</p>
                            <p className="text-zinc-600 text-[11px] font-fira">{a.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-zinc-400 text-sm font-fira">{a.roll}</p>
                        <span className="bg-zinc-800 text-zinc-400 text-[10px] font-fira px-1.5 py-0.5 rounded mt-0.5 inline-block">{a.branch}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggle(a.id)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mx-auto transition-all ${
                            a.attended
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-zinc-700 text-transparent hover:border-zinc-500'
                          }`}
                        >
                          <Check size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
