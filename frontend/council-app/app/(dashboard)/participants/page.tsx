"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useData } from "@/contexts/DataContext";
import { fetchParticipants, type TeamRow, type ParticipantRow } from "@/lib/api";
import { Search, Download, Users, ArrowLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react";

interface FlatParticipant {
  id: number;
  name: string;
  email: string;
  branch: string;
  year: string;
  gender: string;
  phone: string;
  attended: boolean;
  teamName?: string;
  moreDetails: Record<string, string>;
}

function flattenTeams(teams: TeamRow[]): FlatParticipant[] {
  return teams.flatMap(team =>
    team.Participant.map((p: ParticipantRow) => ({
      id: p.id,
      name: p.user?.name ?? "—",
      email: p.user?.email ?? "—",
      branch: p.user?.branch ?? "—",
      year: p.user?.year ? String(p.user.year) : "—",
      gender: p.user?.gender ?? "—",
      phone: p.user?.phone_number ? String(p.user.phone_number) : "—",
      attended: p.ticket_collected,
      teamName: team.name,
      moreDetails:
        p.more_details && typeof p.more_details === "object" && !Array.isArray(p.more_details)
          ? Object.fromEntries(
              Object.entries(p.more_details).map(([k, v]) => [k, String(v ?? "")]),
            )
          : {},
    })),
  );
}

function exportCSV(
  participants: FlatParticipant[],
  name: string,
  detailColumns: { id: string; label: string }[],
) {
  const headers = [
    "Name", "Email", "Branch", "Year", "Gender", "Phone", "Attended",
    ...detailColumns.map((c) => c.label),
  ];
  const rows = [
    headers,
    ...participants.map(p => [
      p.name, p.email, p.branch, p.year, p.gender, p.phone,
      p.attended ? "Yes" : "No",
      ...detailColumns.map((c) => p.moreDetails[c.id] ?? ""),
    ]),
  ];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
    download: `${name}-participants.csv`,
  });
  document.body.appendChild(a); a.click(); a.remove();
}

const STATE_BADGE: Record<string, string> = {
  COMPLETED:         "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  ONGOING:           "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  REGISTRATION_OPEN: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  UPCOMING:          "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
};

export default function ParticipantsPage() {
  const { events }     = useData();
  const searchParams   = useSearchParams();
  const paramEventId   = searchParams.get("event") ? Number(searchParams.get("event")) : null;

  const eligible = events.filter(e => ["COMPLETED", "ONGOING", "REGISTRATION_OPEN"].includes(e.state));

  const [eventId, setEventId]           = useState<number | null>(paramEventId);
  const [teams, setTeams]               = useState<TeamRow[]>([]);
  const [loading, setLoading]           = useState(false);
  const [search, setSearch]             = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [yearFilter, setYearFilter]     = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [attendedFilter, setAttendedFilter] = useState<"all" | "attended" | "absent">("all");

  const selectedEvent = events.find(e => e.id === eventId);
  const raw = useMemo(() => flattenTeams(teams), [teams]);
  const branches      = useMemo(() => [...new Set(raw.map(p => p.branch).filter(b => b !== "—"))], [raw]);
  const attendedCount = raw.filter(p => p.attended).length;

  const detailColumns = useMemo(() => {
    const fields = selectedEvent?.registration_fields ?? [];
    if (!selectedEvent?.more_details_enabled || !fields.length) {
      // Fall back to keys present on participant answers
      const keys = new Set<string>();
      raw.forEach((p) => Object.keys(p.moreDetails).forEach((k) => keys.add(k)));
      return [...keys].map((id) => ({ id, label: id }));
    }
    return fields.map((f) => ({ id: f.id, label: f.label }));
  }, [selectedEvent, raw]);

  const loadParticipants = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const result = await fetchParticipants(eventId);
      setTeams(result);
    } catch {
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { if (eventId) loadParticipants(); }, [eventId, loadParticipants]);

  const filtered = useMemo(() => raw.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (branchFilter && p.branch !== branchFilter) return false;
    if (yearFilter && p.year !== yearFilter) return false;
    if (genderFilter && p.gender !== genderFilter) return false;
    if (attendedFilter === "attended" && !p.attended) return false;
    if (attendedFilter === "absent" && p.attended) return false;
    return true;
  }), [raw, search, branchFilter, yearFilter, genderFilter, attendedFilter]);

  // ── Event picker view ──────────────────────────────────────────────────────────
  if (!eventId) {
    return (
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-8">
          <h1 className="text-tx font-marcellus text-xl sm:text-2xl mb-1">Participants</h1>
          <p className="text-muted-tx text-sm font-fira">Select an event to view its participants.</p>
        </div>
        {eligible.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center">
            <Users size={40} className="text-subtle-tx mb-4" />
            <p className="text-muted-tx font-fira text-sm">No events with participants yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eligible.map(ev => {
              const date = ev.dates?.[0] ? new Date(ev.dates[0]).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
              return (
                <button key={ev.id} type="button" onClick={() => setEventId(ev.id)}
                  className="text-left bg-surface border border-border-c hover:border-red-500/30 rounded-2xl p-5 transition-all group">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-tx font-fira font-semibold text-sm leading-snug group-hover:text-red-500 transition-colors">{ev.name}</p>
                    <ChevronRight size={14} className="text-subtle-tx group-hover:text-red-500 shrink-0 mt-0.5 transition-colors" />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-[10px] font-fira font-semibold px-2 py-0.5 rounded-full ${STATE_BADGE[ev.state] ?? "bg-zinc-100 text-zinc-500"}`}>
                      {ev.state.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-subtle-tx text-xs font-fira">
                      <CalendarDays size={11} /> {date}
                    </div>
                    {ev.venue && (
                      <div className="flex items-center gap-1.5 text-subtle-tx text-xs font-fira">
                        <MapPin size={11} /> {ev.venue}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Participant list view ──────────────────────────────────────────────────────
  const colCount = 6 + detailColumns.length;

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { setEventId(null); setTeams([]); setSearch(""); }}
            className="w-8 h-8 rounded-lg bg-surface border border-border-c hover:border-red-500/20 flex items-center justify-center text-muted-tx hover:text-tx transition-all">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-tx font-marcellus text-xl sm:text-2xl mb-0.5">{selectedEvent?.name ?? "Participants"}</h1>
            <p className="text-muted-tx text-sm font-fira">Participant list</p>
          </div>
        </div>
        <button type="button" onClick={() => exportCSV(filtered, selectedEvent?.name ?? "event", detailColumns)}
          className="flex items-center gap-1.5 px-3 py-2 sm:px-4 bg-surface border border-border-c hover:border-red-500/20 text-muted-tx hover:text-tx text-sm font-fira rounded-lg transition-all">
          <Download size={14} /> <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Total Registered", value: raw.length },
          { label: "Attended",         value: attendedCount },
          { label: "Show-up Rate",     value: raw.length ? `${Math.round((attendedCount / raw.length) * 100)}%` : "—" },
          { label: "Branches",         value: branches.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface border border-border-c rounded-xl p-4">
            <p className="text-subtle-tx text-[11px] font-fira uppercase tracking-widest mb-1">{label}</p>
            <p className="text-tx text-2xl font-fira font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-tx pointer-events-none" />
          <input type="text" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)}
            className="bg-surface border border-border-c focus:border-red-500/40 rounded-lg pl-8 pr-3 py-1.5 text-sm font-fira text-tx placeholder-subtle-tx outline-none transition-colors w-52" />
        </div>
        {branches.length > 1 && (
          <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}
            className="bg-surface border border-border-c rounded-lg px-3 py-1.5 text-sm font-fira text-tx outline-none appearance-none focus:border-red-500/40 transition-colors">
            <option value="">Branch: All</option>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        )}
        <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}
          className="bg-surface border border-border-c rounded-lg px-3 py-1.5 text-sm font-fira text-tx outline-none appearance-none focus:border-red-500/40 transition-colors">
          <option value="">Gender: All</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
        <div className="flex gap-1 bg-surface border border-border-c rounded-lg p-1">
          {(["all", "attended", "absent"] as const).map(v => (
            <button key={v} type="button" onClick={() => setAttendedFilter(v)}
              className={`px-3 py-1 rounded-md text-xs font-fira transition-all capitalize ${attendedFilter === v ? "bg-red-500 text-white" : "text-muted-tx hover:text-tx"}`}>
              {v}
            </button>
          ))}
        </div>
        <span className="text-subtle-tx text-xs font-fira ml-auto">{filtered.length} participants</span>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-surface rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-surface border border-border-c rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-c">
                  {["Name", "Email", "Branch", "Year", "Gender", "Attended", ...detailColumns.map((c) => c.label)].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-subtle-tx text-[11px] font-fira font-normal uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={colCount} className="text-center py-16 text-muted-tx font-fira text-sm">No participants match your filters.</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id} className="border-b border-border-c last:border-0 hover:bg-surface2 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-[11px] font-bold font-fira shrink-0">
                          {p.name[0]}
                        </div>
                        <span className="text-tx text-sm font-fira font-semibold">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-tx text-sm font-fira">{p.email}</td>
                    <td className="px-5 py-3.5 text-muted-tx text-sm font-fira">{p.branch}</td>
                    <td className="px-5 py-3.5 text-muted-tx text-sm font-fira">{p.year}</td>
                    <td className="px-5 py-3.5 text-muted-tx text-sm font-fira capitalize">{p.gender.toLowerCase()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-fira font-semibold px-2 py-0.5 rounded-full ${p.attended ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-surface2 text-muted-tx"}`}>
                        {p.attended ? "Present" : "Absent"}
                      </span>
                    </td>
                    {detailColumns.map((c) => (
                      <td key={c.id} className="px-5 py-3.5 text-muted-tx text-sm font-fira max-w-[14rem] truncate" title={p.moreDetails[c.id] ?? ""}>
                        {p.moreDetails[c.id] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
