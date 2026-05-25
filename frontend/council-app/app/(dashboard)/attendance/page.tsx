"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useData } from "@/contexts/DataContext";
import { fetchParticipants, checkinParticipant, uncheckinParticipant, type TeamRow } from "@/lib/api";
import type { EventData } from "@/lib/dummy-data";
import {
  QrCode, CheckCircle2, XCircle, Users, ChevronRight, ArrowLeft,
  Search, CalendarDays, MapPin, Download, Hash, Loader2,
} from "lucide-react";

// Dynamically import the scanner to avoid SSR issues
const QrScanner = dynamic(() => import("@/components/QrScanner"), { ssr: false });

const INPUT = "bg-surface2 border border-border-c focus:border-red-500/40 rounded-lg px-3 py-2 text-sm font-fira text-tx placeholder-subtle-tx outline-none transition-colors";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlatParticipant {
  id:       number;
  name:     string;
  roll:     string;
  email:    string;
  branch:   string;
  year:     string;
  teamName?: string;
  attended: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenParticipants(teams: TeamRow[]): FlatParticipant[] {
  return teams.flatMap(team =>
    (team.Participant ?? []).map((p) => ({
      id:       p.id as number,
      name:     p.user?.name ?? "Unknown",
      roll:     p.user?.roll_number ? String(p.user.roll_number) : "—",
      email:    p.user?.email ?? "",
      branch:   p.user?.branch ?? "—",
      year:     p.user?.year ? String(p.user.year) : "—",
      teamName: team.name ?? undefined,
      attended: p.attended ?? false,
    }))
  );
}

const ATTENDANCE_ELIGIBLE_STATES = [
  "REGISTRATION_OPEN",
  "REGISTRATION_CLOSED",
  "TICKET_OPEN",
  "TICKET_CLOSED",
  "ONGOING",
  "COMPLETED",
];

function exportCSV(participants: FlatParticipant[], attendance: Record<string, boolean>, eventName: string) {
  const rows = [
    ["Name", "Roll No", "Branch", "Year", "Email", "Team", "Attended"],
    ...participants.map(p => [
      p.name, p.roll, p.branch, p.year, p.email, p.teamName ?? "—",
      (attendance[String(p.id)] ?? false) ? "Yes" : "No",
    ]),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
    download: `${eventName.replace(/\s+/g, "-")}-attendance.csv`,
  });
  document.body.appendChild(a); a.click(); a.remove();
}

// ─── Toast helper ─────────────────────────────────────────────────────────────

interface Toast { id: number; msg: string; type: "success" | "error" }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const { events, loading: eventsLoading } = useData();

  const eligibleEvents = useMemo(() =>
    events.filter(e => ATTENDANCE_ELIGIBLE_STATES.includes(e.state)),
    [events]
  );

  const [eventId, setEventId]           = useState<number | null>(null);
  const [search, setSearch]             = useState("");
  const [attendance, setAttendance]     = useState<Record<string, boolean>>({});
  const [participants, setParticipants] = useState<FlatParticipant[]>([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [showScanner, setShowScanner]   = useState(false);
  const [toasts, setToasts]             = useState<Toast[]>([]);
  const [pendingIds, setPendingIds]     = useState<Set<number>>(new Set());
  const [manualRoll, setManualRoll]     = useState("");
  const [manualErr, setManualErr]       = useState("");
  const manualRef = useRef<HTMLInputElement>(null);
  const toastId = useRef(0);

  const selectedEvent = useMemo(() => events.find(e => e.id === eventId) ?? null, [events, eventId]);

  const addToast = useCallback((msg: string, type: Toast["type"] = "success") => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const loadParticipants = useCallback(async (id: number) => {
    setLoadingParts(true);
    setParticipants([]);
    setAttendance({});
    try {
      const teams = await fetchParticipants(id);
      const flat = flattenParticipants(teams);
      setParticipants(flat);
      const initial: Record<string, boolean> = {};
      flat.forEach(p => { initial[String(p.id)] = p.attended; });
      setAttendance(initial);
    } catch {
      setParticipants([]);
    } finally {
      setLoadingParts(false);
    }
  }, []);

  useEffect(() => {
    if (eventId !== null) loadParticipants(eventId);
  }, [eventId, loadParticipants]);

  const effectiveAttendance = useMemo(() => {
    const base: Record<string, boolean> = {};
    participants.forEach(p => { base[String(p.id)] = attendance[String(p.id)] ?? false; });
    return base;
  }, [participants, attendance]);

  const checkedIn = Object.values(effectiveAttendance).filter(Boolean).length;
  const total     = participants.length;
  const pct       = total > 0 ? Math.round(checkedIn / total * 100) : 0;

  const filtered = participants.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.roll.toLowerCase().includes(search.toLowerCase())
  );

  // ── API-backed attendance toggle ──────────────────────────────────────────

  const toggleAttendance = useCallback(async (participantId: number) => {
    if (!eventId || pendingIds.has(participantId)) return;
    const current = effectiveAttendance[String(participantId)] ?? false;
    const next = !current;

    // Optimistic update
    setAttendance(prev => ({ ...prev, [String(participantId)]: next }));
    setPendingIds(prev => new Set(prev).add(participantId));

    try {
      if (next) {
        await checkinParticipant(eventId, participantId);
      } else {
        await uncheckinParticipant(eventId, participantId);
      }
    } catch {
      // Revert on failure
      setAttendance(prev => ({ ...prev, [String(participantId)]: current }));
      addToast("Failed to update attendance. Please try again.", "error");
    } finally {
      setPendingIds(prev => { const s = new Set(prev); s.delete(participantId); return s; });
    }
  }, [eventId, effectiveAttendance, pendingIds, addToast]);

  // ── QR scan handler ────────────────────────────────────────────────────────

  const handleQrScan = useCallback(async (raw: string) => {
    setShowScanner(false);
    if (!eventId) return;

    let participantId: number | null = null;
    let scannedEventId: number | null = null;

    try {
      const parsed = JSON.parse(raw) as { event_id?: number; participant_id?: number };
      participantId = parsed.participant_id ?? null;
      scannedEventId = parsed.event_id ?? null;
    } catch {
      // Legacy format: raw string is just the participant ID
      const n = parseInt(raw);
      if (!isNaN(n)) participantId = n;
    }

    if (!participantId) {
      addToast("Invalid QR code — could not read participant ID.", "error");
      return;
    }

    if (scannedEventId && scannedEventId !== eventId) {
      addToast(`QR belongs to a different event (ID ${scannedEventId}).`, "error");
      return;
    }

    const participant = participants.find(p => p.id === participantId);
    if (!participant) {
      addToast(`Participant #${participantId} is not registered for this event.`, "error");
      return;
    }

    if (effectiveAttendance[String(participantId)]) {
      addToast(`${participant.name} is already checked in.`, "error");
      return;
    }

    setAttendance(prev => ({ ...prev, [String(participantId)]: true }));
    setPendingIds(prev => new Set(prev).add(participantId!));

    try {
      await checkinParticipant(eventId, participantId);
      addToast(`✓ ${participant.name} (${participant.roll}) checked in via QR`);
    } catch {
      setAttendance(prev => ({ ...prev, [String(participantId)]: false }));
      addToast("Check-in failed. Please try again.", "error");
    } finally {
      setPendingIds(prev => { const s = new Set(prev); s.delete(participantId!); return s; });
    }
  }, [eventId, participants, effectiveAttendance, addToast]);

  // ── Manual check-in ───────────────────────────────────────────────────────

  const handleManualCheckIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    const roll = manualRoll.trim().toUpperCase();
    if (!roll) return;
    const participant = participants.find(p => p.roll.toUpperCase() === roll);
    if (!participant) {
      setManualErr(`Roll number "${roll}" not found in participant list.`);
      return;
    }
    if (effectiveAttendance[String(participant.id)]) {
      setManualErr(`${participant.name} is already checked in.`);
      return;
    }
    setManualRoll("");
    setManualErr("");
    manualRef.current?.focus();

    setAttendance(prev => ({ ...prev, [String(participant.id)]: true }));
    setPendingIds(prev => new Set(prev).add(participant.id));

    try {
      await checkinParticipant(eventId, participant.id);
      addToast(`✓ ${participant.name} (${roll}) checked in manually`);
    } catch {
      setAttendance(prev => ({ ...prev, [String(participant.id)]: false }));
      addToast("Check-in failed. Please try again.", "error");
    } finally {
      setPendingIds(prev => { const s = new Set(prev); s.delete(participant.id); return s; });
    }
  }, [eventId, manualRoll, participants, effectiveAttendance, addToast]);

  /* ── Event picker ── */
  if (eventId === null) return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-tx font-marcellus text-xl sm:text-2xl mb-1">Attendance</h1>
        <p className="text-muted-tx text-sm font-fira">Select an event to manage attendance.</p>
      </div>

      {eventsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-surface rounded-xl" />)}
        </div>
      ) : eligibleEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CheckCircle2 size={40} className="text-subtle-tx mb-4" />
          <p className="text-muted-tx font-fira text-sm">No eligible events found.</p>
          <p className="text-subtle-tx font-fira text-xs mt-1">Events must be Registration Open, Ongoing, or Completed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {eligibleEvents.map((ev: EventData) => {
            const date = ev.dates?.[0] ? new Date(ev.dates[0]).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
            const stageColor = ev.state === "ONGOING" ? "text-amber-500" : ev.state === "COMPLETED" ? "text-muted-tx" : "text-sky-500";
            return (
              <button key={ev.id} type="button" onClick={() => setEventId(ev.id)}
                className="bg-surface border border-border-c hover:border-red-500/30 rounded-xl p-5 text-left transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-fira font-semibold uppercase tracking-widest ${stageColor}`}>
                    {ev.state.replace(/_/g, " ")}
                  </span>
                  <ChevronRight size={14} className="text-subtle-tx group-hover:text-red-500 transition-colors" />
                </div>
                <h3 className="text-tx font-fira font-semibold text-sm mb-2 group-hover:text-red-500 transition-colors">{ev.name}</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-tx text-xs font-fira"><CalendarDays size={11} /> {date}</div>
                  {ev.venue && <div className="flex items-center gap-1.5 text-muted-tx text-xs font-fira"><MapPin size={11} /> {ev.venue}</div>}
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
      {/* QR Scanner Modal */}
      {showScanner && (
        <QrScanner onScan={handleQrScan} onClose={() => setShowScanner(false)} />
      )}

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-40 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-xl text-sm font-fira flex items-center gap-2 shadow-lg pointer-events-auto
            ${t.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              : "bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400"
            }`}>
            {t.type === "success" ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={() => { setEventId(null); setSearch(""); setAttendance({}); setManualRoll(""); setManualErr(""); }}
            className="w-8 h-8 rounded-lg bg-surface2 border border-border-c hover:border-red-500/30 flex items-center justify-center text-muted-tx hover:text-tx transition-all">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-tx font-marcellus text-xl mb-0.5">{selectedEvent?.name}</h1>
            <p className="text-muted-tx text-xs sm:text-sm font-fira">Attendance Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button"
            onClick={() => exportCSV(participants, effectiveAttendance, selectedEvent?.name ?? "event")}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx text-xs font-fira rounded-lg transition-all">
            <Download size={13} /> <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button type="button"
            onClick={() => setShowScanner(true)}
            disabled={loadingParts}
            className={`flex items-center gap-2 px-3 py-2 sm:px-4 text-sm font-fira font-semibold rounded-lg transition-all ${
              loadingParts ? "bg-surface2 text-muted-tx cursor-wait" : "bg-red-500 hover:bg-red-600 text-white"
            }`}>
            <QrCode size={15} /> Scan QR
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loadingParts ? (
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 bg-surface rounded-xl" />
            <div className="h-20 bg-surface rounded-xl" />
            <div className="h-20 bg-surface rounded-xl" />
          </div>
          <div className="h-10 bg-surface rounded-xl" />
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-surface rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
            {[
              { label: "Registered", value: total,     color: "text-tx"          },
              { label: "Checked In", value: checkedIn, color: "text-emerald-500" },
              { label: "Rate",       value: `${pct}%`, color: pct >= 70 ? "text-emerald-500" : pct >= 40 ? "text-amber-500" : "text-red-500" },
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
            <p className="text-tx text-sm font-fira font-semibold mb-3 flex items-center gap-2">
              <Hash size={14} /> Manual Roll-Number Check-in
            </p>
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

          {/* Search + bulk controls */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-tx pointer-events-none" />
              <input type="text" placeholder="Search name or roll…" value={search}
                onChange={e => setSearch(e.target.value)} className={`${INPUT} pl-8 w-full`} />
            </div>
          </div>

          {/* Participant list */}
          <div className="bg-surface border border-border-c rounded-xl overflow-hidden">
            {participants.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={32} className="text-subtle-tx mx-auto mb-3" />
                <p className="text-muted-tx text-sm font-fira">No participants registered yet.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={32} className="text-subtle-tx mx-auto mb-3" />
                <p className="text-muted-tx text-sm font-fira">No participants match your search.</p>
              </div>
            ) : (
              filtered.map(p => {
                const present = effectiveAttendance[String(p.id)] ?? false;
                const pending = pendingIds.has(p.id);
                return (
                  <div key={String(p.id)}
                    className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-border-c last:border-0 hover:bg-surface2 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-surface2 border border-border-c flex items-center justify-center text-muted-tx text-xs font-fira font-bold shrink-0">
                      {p.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-tx text-sm font-fira font-semibold truncate">{p.name}</p>
                      <p className="text-muted-tx text-xs font-fira">
                        {p.roll} · {p.branch}{p.teamName ? ` · ${p.teamName}` : ""}
                      </p>
                    </div>
                    <span className={`hidden sm:inline text-[11px] font-fira font-medium px-2 py-0.5 rounded-full ${
                      present
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-surface2 text-muted-tx"
                    }`}>
                      {present ? "Present" : "Absent"}
                    </span>
                    <button type="button"
                      onClick={() => toggleAttendance(p.id)}
                      disabled={pending}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all border ${
                        pending
                          ? "bg-surface2 border-border-c text-muted-tx cursor-wait"
                          : present
                            ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-500/30 hover:text-red-500"
                            : "bg-surface2 border-border-c text-muted-tx hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:text-emerald-500"
                      }`}>
                      {pending
                        ? <Loader2 size={14} className="animate-spin" />
                        : present ? <CheckCircle2 size={16} /> : <XCircle size={16} />
                      }
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
