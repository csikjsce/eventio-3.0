"use client";
import { useState, useMemo } from "react";
import { MOCK_EVENTS, MOCK_PARTICIPANTS, type Participant } from "@/lib/dummy-data";
import { Search, Download, Users, ArrowLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react";

function exportCSV(participants: Participant[], name: string) {
  const rows = [
    ["Name","Roll No","Branch","Year","Gender","Email","Phone","Attended"],
    ...participants.map(p => [p.name,p.roll,p.branch,p.year,p.gender,p.email,p.phone,p.attended?"Yes":"No"]),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([csv],{type:"text/csv"})),
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

const INPUT = "bg-surface2 border border-border-c focus:border-red-500/40 rounded-lg px-3 py-1.5 text-sm font-fira text-tx placeholder-subtle-tx outline-none transition-colors";

export default function ParticipantsPage() {
  const eligible = MOCK_EVENTS.filter(e => ["COMPLETED","ONGOING","REGISTRATION_OPEN"].includes(e.state));
  const [eventId, setEventId]           = useState<number | null>(null);
  const [search, setSearch]             = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [yearFilter, setYearFilter]     = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [attendedFilter, setAttendedFilter] = useState<"all"|"attended"|"absent">("all");

  const selectedEvent = MOCK_EVENTS.find(e => e.id === eventId);
  const raw: Participant[] = eventId != null ? (MOCK_PARTICIPANTS[eventId] ?? MOCK_PARTICIPANTS[1] ?? []) : [];
  const branches = [...new Set(raw.map(p => p.branch))];
  const attendedCount = raw.filter(p => p.attended).length;

  const filtered = useMemo(() => raw.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.roll.toLowerCase().includes(search.toLowerCase())) return false;
    if (branchFilter && p.branch !== branchFilter) return false;
    if (yearFilter && p.year !== yearFilter) return false;
    if (genderFilter && p.gender !== genderFilter) return false;
    if (attendedFilter === "attended" && !p.attended) return false;
    if (attendedFilter === "absent" && p.attended) return false;
    return true;
  }), [raw, search, branchFilter, yearFilter, genderFilter, attendedFilter]);

  /* ── Event picker ── */
  if (eventId === null) return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="mb-8">
        <h1 className="text-tx font-marcellus text-2xl mb-1">Participants</h1>
        <p className="text-muted-tx text-sm font-fira">Select an event to browse its participants.</p>
      </div>
      {eligible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users size={40} className="text-subtle-tx mb-4" />
          <p className="text-muted-tx font-fira text-sm">No events with participants yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {eligible.map(ev => {
            const parts = MOCK_PARTICIPANTS[ev.id] ?? MOCK_PARTICIPANTS[1] ?? [];
            const attended = parts.filter(p => p.attended).length;
            const date = ev.dates?.[0] ? new Date(ev.dates[0]).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—";
            return (
              <button key={ev.id} type="button"
                onClick={() => { setEventId(ev.id); setSearch(""); setBranchFilter(""); setYearFilter(""); setGenderFilter(""); setAttendedFilter("all"); }}
                className="bg-surface border border-border-c hover:border-red-500/30 rounded-xl p-5 text-left transition-all group">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-fira uppercase tracking-widest px-2 py-0.5 rounded-md bg-surface2 text-subtle-tx">{ev.event_type}</span>
                  <span className={`text-[10px] font-fira uppercase tracking-widest px-2 py-0.5 rounded-md ${STATE_BADGE[ev.state] ?? "bg-surface2 text-subtle-tx"}`}>{ev.state.replace(/_/g," ")}</span>
                </div>
                <h3 className="text-tx font-fira font-semibold text-sm leading-snug mb-1 group-hover:text-red-500 transition-colors">{ev.name}</h3>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-muted-tx text-xs font-fira"><CalendarDays size={11} />{date}</div>
                  {ev.venue && <div className="flex items-center gap-2 text-muted-tx text-xs font-fira"><MapPin size={11} />{ev.venue}</div>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border-c">
                  <div className="flex items-center gap-1.5 text-muted-tx text-xs font-fira">
                    <Users size={12} />
                    <span className="text-tx font-bold">{parts.length}</span> registered
                    <span className="text-subtle-tx mx-1">·</span>
                    <span className="text-emerald-500 font-bold">{attended}</span> attended
                  </div>
                  <ChevronRight size={14} className="text-subtle-tx group-hover:text-red-500 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ── Participant table ── */
  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setEventId(null)}
            className="w-8 h-8 rounded-lg bg-surface2 border border-border-c hover:border-red-500/30 flex items-center justify-center text-muted-tx hover:text-tx transition-all">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-tx font-marcellus text-2xl mb-0.5">{selectedEvent?.name}</h1>
            <p className="text-muted-tx text-sm font-fira">Participants</p>
          </div>
        </div>
        <button type="button" onClick={() => exportCSV(filtered, selectedEvent!.name)}
          className="flex items-center gap-2 px-4 py-2 bg-surface2 border border-border-c hover:border-red-500/30 text-muted-tx hover:text-tx text-xs font-fira rounded-lg transition-all">
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Total Registered", value: raw.length           },
          { label: "Attended",         value: attendedCount        },
          { label: "Show-up Rate",     value: `${raw.length > 0 ? Math.round(attendedCount/raw.length*100) : 0}%` },
          { label: "Branches",         value: branches.length      },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface border border-border-c rounded-xl p-4">
            <p className="text-subtle-tx text-[11px] font-fira uppercase tracking-widest mb-1">{label}</p>
            <p className="text-tx text-2xl font-fira font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-tx pointer-events-none" />
          <input type="text" placeholder="Search by name or roll…" value={search} onChange={e => setSearch(e.target.value)}
            className={`${INPUT} pl-8 w-60`} />
        </div>
        <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className={INPUT}>
          <option value="">Branch: All</option>{branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className={INPUT}>
          <option value="">Year: All</option>{["FY","SY","TY","LY"].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className={INPUT}>
          <option value="">Gender: All</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
        <div className="flex gap-1 bg-surface2 border border-border-c rounded-lg p-1">
          {(["all","attended","absent"] as const).map(v => (
            <button key={v} type="button" onClick={() => setAttendedFilter(v)}
              className={`px-3 py-1 text-xs font-fira rounded-md transition-all capitalize ${attendedFilter === v ? "bg-red-500 text-white" : "text-muted-tx hover:text-tx"}`}>
              {v}
            </button>
          ))}
        </div>
        <span className="text-subtle-tx text-xs font-fira ml-auto">{filtered.length} participants</span>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border-c rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-c">
                {["Name","Roll No","Branch","Year","Gender","Email","Attendance",""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-subtle-tx text-[11px] font-fira font-normal uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-muted-tx font-fira text-sm">No participants match your filters.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-border-c hover:bg-surface2 transition-colors last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-[11px] font-bold font-fira shrink-0">
                        {p.name[0]}
                      </div>
                      <span className="text-tx text-sm font-fira font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-tx text-sm font-fira">{p.roll}</td>
                  <td className="px-5 py-3.5">
                    <span className="bg-surface2 text-muted-tx text-[11px] font-fira px-2 py-0.5 rounded-md border border-border-c">{p.branch}</span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-tx text-sm font-fira">{p.year}</td>
                  <td className="px-5 py-3.5 text-muted-tx text-sm font-fira">{p.gender}</td>
                  <td className="px-5 py-3.5 text-subtle-tx text-xs font-fira">{p.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-fira font-semibold px-2 py-0.5 rounded-full ${p.attended ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-surface2 text-muted-tx"}`}>
                      {p.attended ? "Present" : "Absent"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button type="button" onClick={() => exportCSV([p], p.name)} className="text-subtle-tx hover:text-tx transition-colors" title="Download">
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
