"use client";
import { useState, useMemo, useRef } from "react";
import { MOCK_EVENTS, MOCK_PARTICIPANTS, type Participant } from "@/lib/dummy-data";
import { QrCode, CheckCircle2, XCircle, Users, ChevronRight, ArrowLeft, Search, CalendarDays, MapPin, Download, Hash } from "lucide-react";

const INPUT = "bg-surface2 border border-border-c focus:border-red-500/40 rounded-lg px-3 py-2 text-sm font-fira text-tx placeholder-subtle-tx outline-none transition-colors";

function exportCSV(participants: Participant[], attendance: Record<number, boolean>, eventName: string) {
  const rows = [
    ["Name", "Roll No", "Branch", "Year", "Gender", "Email", "Phone", "Attended"],
    ...participants.map(p => [
      p.name, p.roll, p.branch, p.year, p.gender, p.email, p.phone,
      (attendance[p.id] ?? p.attended) ? "Yes" : "No",
    ]),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
    download: `${eventName.replace(/\s+/g, "-")}-attendance.csv`,
  });
  document.body.appendChild(a); a.click(); a.remove();
}

export default function AttendancePage() {
  const eligibleEvents = MOCK_EVENTS.filter(e =>
    ["ONGOING", "COMPLETED", "REGISTRATION_OPEN"].includes(e.state)
  );
  const [eventId, setEventId]         = useState<number | null>(null);
  const [search, setSearch]           = useState("");
  const [attendance, setAttendance]   = useState<Record<number, boolean>>({});
  const [scanning, setScanning]       = useState(false);
  const [scanResult, setScanResult]   = useState<string | null>(null);
  const [manualRoll, setManualRoll]   = useState("");
  const [manualErr, setManualErr]     = useState("");
  const manualRef = useRef<HTMLInputElement>(null);

  const selectedEvent = MOCK_EVENTS.find(e => e.id === eventId);
  const raw: Participant[] = eventId != null ? (MOCK_PARTICIPANTS[eventId] ?? MOCK_PARTICIPANTS[1] ?? []) : [];

  const effectiveAttendance = useMemo(() => {
    const base: Record<number, boolean> = {};
    raw.forEach(p => { base[p.id] = attendance[p.id] ?? p.attended; });
    return base;
  }, [raw, attendance]);

  const checkedIn = Object.values(effectiveAttendance).filter(Boolean).length;
  const total     = raw.length;
  const pct       = total > 0 ? Math.round(checkedIn / total * 100) : 0;

  const filtered = raw.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.roll.toLowerCase().includes(search.toLowerCase())
  );

  function toggleAttendance(id: number) {
    setAttendance(prev => ({ ...prev, [id]: !effectiveAttendance[id] }));
  }

  function markAll(val: boolean) {
    const update: Record<number, boolean> = {};
    raw.forEach(p => { update[p.id] = val; });
    setAttendance(update);
  }

  function simulateScan() {
    const absent = raw.filter(p => !effectiveAttendance[p.id]);
    if (!absent.length) { setScanResult("All participants already checked in!"); return; }
    const pick = absent[Math.floor(Math.random() * absent.length)];
    setScanning(true);
    setTimeout(() => {
      setAttendance(prev => ({ ...prev, [pick.id]: true }));
      setScanResult(`✓ ${pick.name} (${pick.roll}) checked in via QR`);
      setScanning(false);
      setTimeout(() => setScanResult(null), 3500);
    }, 800);
  }

  function handleManualCheckIn(e: React.FormEvent) {
    e.preventDefault();
    const roll = manualRoll.trim().toUpperCase();
    if (!roll) return;
    const participant = raw.find(p => p.roll.toUpperCase() === roll);
    if (!participant) {
      setManualErr(`Roll number "${roll}" not found in participant list.`);
      return;
    }
    if (effectiveAttendance[participant.id]) {
      setManualErr(`${participant.name} is already checked in.`);
      return;
    }
    setAttendance(prev => ({ ...prev, [participant.id]: true }));
    setScanResult(`✓ ${participant.name} (${roll}) checked in manually`);
    setManualRoll("");
    setManualErr("");
    setTimeout(() => setScanResult(null), 3500);
    manualRef.current?.focus();
  }

  /* ── Event picker ── */
  if (eventId === null) return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-tx font-marcellus text-xl sm:text-2xl mb-1">Attendance</h1>
        <p className="text-muted-tx text-sm font-fira">Select an event to manage attendance.</p>
      </div>
      {eligibleEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CheckCircle2 size={40} className="text-subtle-tx mb-4" />
          <p className="text-muted-tx font-fira text-sm">No eligible events found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {eligibleEvents.map(ev => {
            const parts   = MOCK_PARTICIPANTS[ev.id] ?? MOCK_PARTICIPANTS[1] ?? [];
            const attended = parts.filter(p => p.attended).length;
            const pct      = parts.length > 0 ? Math.round(attended / parts.length * 100) : 0;
            const date     = ev.dates?.[0] ? new Date(ev.dates[0]).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
            const stateColor = ev.state === "ONGOING" ? "text-amber-500" : ev.state === "COMPLETED" ? "text-muted-tx" : "text-sky-500";
            return (
              <button key={ev.id} type="button" onClick={() => setEventId(ev.id)}
                className="bg-surface border border-border-c hover:border-red-500/30 rounded-xl p-5 text-left transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-fira font-semibold uppercase tracking-widest ${stateColor}`}>{ev.state.replace(/_/g, " ")}</span>
                  <ChevronRight size={14} className="text-subtle-tx group-hover:text-red-500 transition-colors" />
                </div>
                <h3 className="text-tx font-fira font-semibold text-sm mb-2 group-hover:text-red-500 transition-colors">{ev.name}</h3>
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-1.5 text-muted-tx text-xs font-fira"><CalendarDays size={11} /> {date}</div>
                  {ev.venue && <div className="flex items-center gap-1.5 text-muted-tx text-xs font-fira"><MapPin size={11} /> {ev.venue}</div>}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-subtle-tx text-[11px] font-fira">{attended}/{parts.length} checked in</span>
                    <span className="text-tx text-[11px] font-fira font-bold">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ── Attendance manager ── */
  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { setEventId(null); setSearch(""); setAttendance({}); setScanResult(null); setManualRoll(""); setManualErr(""); }}
            className="w-8 h-8 rounded-lg bg-surface2 border border-border-c hover:border-red-500/30 flex items-center justify-center text-muted-tx hover:text-tx transition-all">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-tx font-marcellus text-xl mb-0.5">{selectedEvent?.name}</h1>
            <p className="text-muted-tx text-xs sm:text-sm font-fira">Attendance Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => exportCSV(raw, effectiveAttendance, selectedEvent?.name ?? "event")}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx text-xs font-fira rounded-lg transition-all">
            <Download size={13} /> <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button type="button" onClick={simulateScan} disabled={scanning}
            className={`flex items-center gap-2 px-3 py-2 sm:px-4 text-sm font-fira font-semibold rounded-lg transition-all ${scanning ? "bg-surface2 text-muted-tx cursor-wait" : "bg-red-500 hover:bg-red-600 text-white"}`}>
            <QrCode size={15} /> {scanning ? "Scanning…" : "Scan QR"}
          </button>
        </div>
      </div>

      {/* Scan result / toast */}
      {scanResult && (
        <div className="mb-4 px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-fira flex items-center gap-2">
          <CheckCircle2 size={15} /> {scanResult}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
        {[
          { label: "Registered",  value: total,      color: "text-tx"          },
          { label: "Checked In",  value: checkedIn,  color: "text-emerald-500" },
          { label: "Rate",        value: `${pct}%`,  color: pct >= 70 ? "text-emerald-500" : pct >= 40 ? "text-amber-500" : "text-red-500" },
        ].map(s => (
          <div key={s.label} className="bg-surface border border-border-c rounded-xl p-4">
            <p className="text-subtle-tx text-[10px] sm:text-[11px] font-fira uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl sm:text-3xl font-fira font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-surface border border-border-c rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-tx text-sm font-fira font-semibold">Overall Progress</p>
          <span className="text-muted-tx text-xs font-fira">{checkedIn} / {total}</span>
        </div>
        <div className="h-2.5 bg-surface2 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Manual check-in */}
      <div className="bg-surface border border-border-c rounded-xl p-4 mb-5">
        <p className="text-tx text-sm font-fira font-semibold mb-3 flex items-center gap-2"><Hash size={14} /> Manual Roll-Number Check-in</p>
        <form onSubmit={handleManualCheckIn} className="flex gap-2">
          <input
            ref={manualRef}
            type="text"
            placeholder="Enter roll number (e.g. 21COMP001)"
            value={manualRoll}
            onChange={e => { setManualRoll(e.target.value); setManualErr(""); }}
            className={`${INPUT} flex-1 uppercase`}
          />
          <button type="submit"
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-fira font-semibold rounded-lg transition-colors shrink-0">
            Check In
          </button>
        </form>
        {manualErr && <p className="text-red-500 text-xs font-fira mt-1.5">{manualErr}</p>}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-tx pointer-events-none" />
          <input type="text" placeholder="Search name or roll…" value={search} onChange={e => setSearch(e.target.value)} className={`${INPUT} pl-8 w-full`} />
        </div>
        <button type="button" onClick={() => markAll(true)}
          className="px-3 py-2 text-xs font-fira bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all whitespace-nowrap">
          Mark All Present
        </button>
        <button type="button" onClick={() => markAll(false)}
          className="px-3 py-2 text-xs font-fira bg-surface2 text-muted-tx border border-border-c rounded-lg hover:border-red-500/30 transition-all whitespace-nowrap">
          Mark All Absent
        </button>
      </div>

      {/* List */}
      <div className="bg-surface border border-border-c rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={32} className="text-subtle-tx mx-auto mb-3" />
            <p className="text-muted-tx text-sm font-fira">No participants match your search.</p>
          </div>
        ) : (
          filtered.map(p => {
            const present = effectiveAttendance[p.id] ?? false;
            return (
              <div key={p.id} className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-border-c last:border-0 hover:bg-surface2 transition-colors">
                <div className="w-8 h-8 rounded-full bg-surface2 border border-border-c flex items-center justify-center text-muted-tx text-xs font-fira font-bold shrink-0">
                  {p.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-tx text-sm font-fira font-semibold truncate">{p.name}</p>
                  <p className="text-muted-tx text-xs font-fira">{p.roll} · {p.branch} · {p.year}</p>
                </div>
                <span className={`hidden sm:inline text-[11px] font-fira font-medium px-2 py-0.5 rounded-full ${present ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-surface2 text-muted-tx"}`}>
                  {present ? "Present" : "Absent"}
                </span>
                <button type="button" onClick={() => toggleAttendance(p.id)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all border ${
                    present
                      ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-500/30 hover:text-red-500"
                      : "bg-surface2 border-border-c text-muted-tx hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:text-emerald-500"
                  }`}>
                  {present ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
