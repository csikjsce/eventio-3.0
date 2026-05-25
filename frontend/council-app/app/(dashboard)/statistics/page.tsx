"use client";
import { useMemo, useState, useEffect } from "react";
import { fetchStats, type StatsItem } from "@/lib/api";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, Search, CalendarDays, Users, BarChart3, Heart, TrendingUp, TrendingDown, Minus, ArrowLeft } from "lucide-react";

/* ── Pastel palette ── */
const PASTEL = [
  "#fca5a5", "#93c5fd", "#6ee7b7", "#fcd34d",
  "#c4b5fd", "#5eead4", "#fdba74", "#f9a8d4",
  "#a5f3fc", "#d9f99d",
];
const GENDER_PASTEL = ["#93c5fd", "#f9a8d4"]; // sky blue, pink

const BRANCH_ABBR: Record<string, string> = {
  Computer_Engineering: "COMP", Information_Technology: "IT", Mechanical: "Mech",
  Artificial_Intelligence_And_Data_Science: "AIDS", Electronics_And_Computers: "EXCP",
  Computer_Science_And_Business_Systems: "CSBS", Electronics_And_Telecommunications: "EXTC",
  Robotics_And_Artificial_Intelligence: "RAI", Electronics: "ETRX",
};

type StatsData = StatsItem;
type Tab = "overview" | "events";

/* ── Tooltip ── */
function DarkTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border-c rounded-lg px-3 py-2 shadow-xl text-xs font-fira">
      {label && <p className="text-muted-tx mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-tx font-semibold">
          {p.name && <span className="text-muted-tx font-normal">{p.name}: </span>}
          {p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, sub, accent, trend, icon: Icon }: {
  label: string; value: string | number; sub?: string; accent?: boolean;
  trend?: { direction: "up" | "down" | "neutral"; text: string };
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className={`bg-surface border rounded-2xl p-5 transition-colors ${accent ? "border-red-400/30" : "border-border-c"}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-subtle-tx text-[11px] font-fira uppercase tracking-widest">{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${accent ? "bg-red-400/15 text-red-400" : "bg-surface2 text-muted-tx"}`}>
            <Icon size={15} />
          </div>
        )}
      </div>
      <p className={`font-fira font-bold leading-tight mb-3 ${typeof value === "string" && value.length > 10 ? "text-xl" : "text-3xl"} ${accent ? "text-red-500" : "text-tx"}`}>
        {value}
      </p>
      <div className="flex items-center gap-2 flex-wrap min-h-[18px]">
        {sub && <p className="text-subtle-tx text-xs font-fira">{sub}</p>}
        {trend && (
          <span className={`flex items-center gap-1 text-[11px] font-fira font-semibold px-2 py-0.5 rounded-full ml-auto ${
            trend.direction === "up"
              ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"
              : trend.direction === "down"
                ? "text-red-600 bg-red-500/10 dark:text-red-400"
                : "text-muted-tx bg-surface2"
          }`}>
            {trend.direction === "up" ? <TrendingUp size={10} /> : trend.direction === "down" ? <TrendingDown size={10} /> : <Minus size={10} />}
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
}

function exportCSV(data: StatsData[]) {
  const rows = [
    ["Event Name", "Date", "Total Participants", "Male", "Female", "Top Branch", "Branches Reached"],
    ...data.map(e => {
      const top = Object.entries(e.branchStats).sort((a, b) => b[1] - a[1])[0];
      return [e.eventName, new Date(e.dates[0]).toLocaleDateString("en-IN"), e.totalParticipants,
        e.genderStats["MALE"] || 0, e.genderStats["FEMALE"] || 0,
        top ? (BRANCH_ABBR[top[0]] || top[0]) : "-", Object.keys(e.branchStats).length];
    }),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
    download: "council-stats.csv",
  });
  document.body.appendChild(a); a.click(); a.remove();
}

export default function StatisticsPage() {
  const [tab, setTab]         = useState<Tab>("overview");
  const [drill, setDrill]     = useState<StatsData | null>(null);
  const [search, setSearch]   = useState("");
  const [statsData, setStatsData] = useState<StatsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then(data => setStatsData(data))
      .catch(() => setStatsData([]))
      .finally(() => setLoading(false));
  }, []);

  const allBranch = useMemo(() => {
    const agg: Record<string, number> = {};
    statsData.forEach(e => Object.entries(e.branchStats).forEach(([b, c]) => {
      const k = BRANCH_ABBR[b] || b; agg[k] = (agg[k] || 0) + c;
    }));
    return Object.entries(agg).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [statsData]);

  const allGender = useMemo(() => {
    const agg: Record<string, number> = {};
    statsData.forEach(e => Object.entries(e.genderStats).forEach(([g, c]) => { agg[g] = (agg[g] || 0) + c; }));
    return Object.entries(agg).map(([name, value]) => ({ name, value }));
  }, [statsData]);

  const barData = statsData.map(e => ({ name: e.eventName, value: e.totalParticipants }));

  const insights = useMemo(() => {
    if (!statsData.length) return null;
    const total  = statsData.reduce((s, e) => s + e.totalParticipants, 0);
    const avg    = Math.round(total / statsData.length);
    const best   = statsData.reduce((m, e) => e.totalParticipants > m.totalParticipants ? e : m, statsData[0]);
    const totalF = statsData.reduce((s, e) => s + (e.genderStats["FEMALE"] || 0), 0);
    const femPct = total > 0 ? Math.round(totalF / total * 100) : 0;
    const sorted = [...statsData].sort((a, b) => new Date(a.dates[0]).getTime() - new Date(b.dates[0]).getTime());
    const growth = sorted.length >= 2 && sorted[0].totalParticipants > 0
      ? Math.round((sorted[sorted.length - 1].totalParticipants - sorted[0].totalParticipants) / sorted[0].totalParticipants * 100)
      : null;
    return { total, avg, best, femPct, totalF, growth, uniqueBranches: allBranch.length };
  }, [statsData, allBranch]);

  const filteredEvents = statsData.filter(e => e.eventName.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-8 sm:py-8 animate-pulse space-y-6">
        <div className="h-10 bg-surface rounded-xl w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-surface rounded-2xl" />)}
        </div>
        <div className="h-64 bg-surface rounded-2xl" />
      </div>
    );
  }

  if (!statsData.length || !insights) {
    return (
      <div className="px-4 py-6 sm:px-8 sm:py-8 flex flex-col items-center justify-center py-24 text-center">
        <BarChart3 size={40} className="text-subtle-tx mb-4" />
        <p className="text-muted-tx font-fira text-sm">No statistics available yet.</p>
        <p className="text-subtle-tx font-fira text-xs mt-1">Statistics appear after events complete.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h1 className="text-tx font-marcellus text-xl sm:text-2xl mb-1">Council Statistics</h1>
          <p className="text-muted-tx text-xs sm:text-sm font-fira">Analytics across all events organised by your council.</p>
        </div>
        <button type="button" onClick={() => exportCSV(statsData)}
          className="shrink-0 flex items-center gap-2 px-3 py-2 sm:px-4 bg-surface border border-border-c hover:border-red-400/40 text-muted-tx hover:text-tx text-xs font-fira rounded-lg transition-all">
          <Download size={13} /> <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      <p className="text-xs font-fira text-muted-tx mb-8">
        <span className="text-tx font-semibold">{statsData.length} Events Tracked</span>
        <span className="mx-2 text-subtle-tx">·</span>
        <span className="text-tx font-semibold">{insights.total.toLocaleString()} Total Participants</span>
        <span className="mx-2 text-subtle-tx">·</span>
        Best: <span className="text-red-500 font-semibold">{insights.best.eventName}</span>
        <span className="text-subtle-tx ml-1">({insights.best.totalParticipants} participants)</span>
      </p>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface border border-border-c rounded-xl w-fit mb-8">
        {(["overview", "events"] as Tab[]).map(t => (
          <button key={t} type="button" onClick={() => { setTab(t); setDrill(null); }}
            className={`px-5 py-2 rounded-lg text-sm font-fira transition-all capitalize ${t === tab ? "bg-red-500 text-white font-semibold" : "text-muted-tx hover:text-tx"}`}>
            {t === "events" ? "Per Event" : t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard label="Events Tracked"      value={statsData.length}  sub="completed events"              accent icon={CalendarDays} />
            <StatCard label="Total Participants"  value={insights.total}    sub={`across ${statsData.length} events`} icon={Users} />
            <StatCard label="Avg / Event"         value={insights.avg}      sub="participants per event"
              trend={insights.growth !== null ? { direction: insights.growth >= 0 ? "up" : "down", text: `${Math.abs(insights.growth)}% growth` } : undefined}
              icon={BarChart3} />
            <StatCard label="Female Inclusion" value={`${insights.femPct}%`} sub={`${insights.totalF} registrants`}
              trend={{ direction: insights.femPct >= 35 ? "up" : insights.femPct >= 20 ? "neutral" : "down", text: insights.femPct >= 35 ? "Healthy" : "Needs work" }}
              icon={Heart} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
            {/* Events table */}
            <div className="lg:col-span-3 bg-surface border border-border-c rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border-c">
                <h3 className="text-tx font-fira font-semibold text-sm">Events Overview</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-c">
                      {["Event Name", "Date", "Participants", "Branches"].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-subtle-tx text-[11px] font-fira font-normal uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const maxP = Math.max(...statsData.map(e => e.totalParticipants), 1);
                      return [...statsData].sort((a, b) => b.totalParticipants - a.totalParticipants).map(ev => (
                        <tr key={ev.eventId} onClick={() => { setDrill(ev); setTab("events"); }}
                          className="border-b border-border-c hover:bg-surface2 cursor-pointer transition-colors group last:border-0">
                          <td className="px-5 py-3.5">
                            <p className="text-tx text-sm font-fira font-semibold group-hover:text-red-500 transition-colors">{ev.eventName}</p>
                          </td>
                          <td className="px-5 py-3.5 text-muted-tx text-sm font-fira whitespace-nowrap">
                            {new Date(ev.dates[0]).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <span className="text-tx text-sm font-fira font-bold w-10 shrink-0">{ev.totalParticipants}</span>
                              <div className="flex-1 h-1.5 bg-surface2 rounded-full overflow-hidden min-w-[60px]">
                                <div className="h-full rounded-full bg-red-400" style={{ width: `${ev.totalParticipants / maxP * 100}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-muted-tx text-sm font-fira">{Object.keys(ev.branchStats).length}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bar chart */}
            <div className="lg:col-span-2 bg-surface border border-border-c rounded-xl p-5">
              <h3 className="text-tx font-fira font-semibold text-sm mb-4">Participants per Event</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} barSize={22}>
                  <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--c-muted)", fontSize: 10, fontFamily: "Fira Sans" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Participants">
                    {barData.map((d, i) => (
                      <Cell key={i} fill={PASTEL[i % PASTEL.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5 border-t border-border-c pt-3">
                {barData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: PASTEL[i % PASTEL.length] }} />
                    <span className="text-muted-tx text-[11px] font-fira truncate flex-1">{d.name}</span>
                    <span className="text-tx text-[11px] font-fira font-bold shrink-0">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Branch + Gender */}
          <div className="grid grid-cols-1 grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div className="bg-surface border border-border-c rounded-xl p-5">
              <h3 className="text-tx font-fira font-semibold text-sm mb-4">Branch Distribution</h3>
              <div className="space-y-3">
                {allBranch.map((d, i) => {
                  const max = allBranch[0]?.value || 1;
                  return (
                    <div key={d.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted-tx text-xs font-fira">{d.name}</span>
                        <span className="text-tx text-xs font-fira font-bold">{d.value}</span>
                      </div>
                      <div className="h-2 bg-surface2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${d.value / max * 100}%`, background: PASTEL[i % PASTEL.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-surface border border-border-c rounded-xl p-5">
              <h3 className="text-tx font-fira font-semibold text-sm mb-4">Gender Distribution</h3>
              <div className="flex flex-col items-center gap-3">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={allGender} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={4}>
                      {allGender.map((_, i) => <Cell key={i} fill={GENDER_PASTEL[i % GENDER_PASTEL.length]} />)}
                    </Pie>
                    <Tooltip content={<DarkTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-8 justify-center">
                  {allGender.map((d, i) => {
                    const tot = allGender.reduce((s, x) => s + x.value, 0);
                    return (
                      <div key={d.name} className="text-center">
                        <div className="flex items-center gap-1.5 justify-center mb-1">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: GENDER_PASTEL[i] }} />
                          <span className="text-muted-tx text-xs font-fira">{d.name}</span>
                        </div>
                        <p className="text-tx text-xl font-fira font-bold">{d.value.toLocaleString()}</p>
                        <p className="text-subtle-tx text-[11px] font-fira">{tot > 0 ? (d.value / tot * 100).toFixed(1) : 0}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PER EVENT LIST ── */}
      {tab === "events" && !drill && (
        <div className="space-y-4">
          <div className="relative w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-tx pointer-events-none" />
            <input type="text" placeholder="Search events…" value={search} onChange={e => setSearch(e.target.value)}
              className="bg-surface border border-border-c focus:border-red-400/40 rounded-lg pl-8 pr-3 py-2 text-sm font-fira text-tx placeholder-subtle-tx outline-none transition-colors w-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredEvents.map((ev, rank) => (
              <button key={ev.eventId} type="button" onClick={() => setDrill(ev)}
                className="bg-surface border border-border-c hover:border-red-400/40 rounded-xl p-4 text-left transition-all group">
                <div className="flex items-start gap-2 mb-1">
                  {rank < 3 && (
                    <span className={`shrink-0 text-[10px] font-fira font-bold px-1.5 py-0.5 rounded mt-0.5 ${rank === 0 ? "bg-red-500/15 text-red-500" : "bg-surface2 text-subtle-tx"}`}>#{rank + 1}</span>
                  )}
                  <p className="text-tx font-fira font-semibold text-sm group-hover:text-red-500 transition-colors">{ev.eventName}</p>
                </div>
                <p className="text-subtle-tx text-xs font-fira mb-3">
                  {new Date(ev.dates[0]).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-red-500 text-2xl font-fira font-bold">{ev.totalParticipants}</p>
                    <p className="text-subtle-tx text-xs font-fira">participants</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-tx text-sm font-fira font-semibold">{ev.genderStats["MALE"] ?? 0}M / {ev.genderStats["FEMALE"] ?? 0}F</p>
                    <p className="text-subtle-tx text-[11px] font-fira">{Object.keys(ev.branchStats).length} branches</p>
                  </div>
                </div>
                {/* Pastel branch bar */}
                <div className="mt-3 flex gap-0.5 h-1.5 rounded-full overflow-hidden">
                  {Object.entries(ev.branchStats).slice(0, 8).map(([b, c], i) => (
                    <div key={b} style={{ flex: c, background: PASTEL[i % PASTEL.length] }} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── DRILL DOWN ── */}
      {tab === "events" && drill && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setDrill(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-fira text-muted-tx hover:text-tx border border-border-c hover:border-red-400/40 rounded-lg transition-all">
              <ArrowLeft size={13} /> All Events
            </button>
            <div>
              <h2 className="text-tx font-marcellus text-lg">{drill.eventName}</h2>
              <p className="text-muted-tx text-xs font-fira mt-0.5">
                {new Date(drill.dates[0]).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard label="Total Participants" value={drill.totalParticipants} accent />
            <StatCard label="Male"   value={drill.genderStats["MALE"] || 0}   sub={`${drill.totalParticipants > 0 ? ((drill.genderStats["MALE"] || 0) / drill.totalParticipants * 100).toFixed(1) : 0}%`} />
            <StatCard label="Female" value={drill.genderStats["FEMALE"] || 0} sub={`${drill.totalParticipants > 0 ? ((drill.genderStats["FEMALE"] || 0) / drill.totalParticipants * 100).toFixed(1) : 0}%`} />
            <StatCard label="Branches" value={Object.keys(drill.branchStats).length} />
          </div>
          <div className="bg-surface border border-border-c rounded-xl p-5">
            <h3 className="text-tx font-fira font-semibold text-sm mb-4">Branch Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(drill.branchStats).sort((a, b) => b[1] - a[1]).map(([b, v], i) => {
                const max = Math.max(...Object.values(drill.branchStats));
                return (
                  <div key={b}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-tx text-xs font-fira">{BRANCH_ABBR[b] || b}</span>
                      <span className="text-tx text-xs font-fira font-bold">{v}</span>
                    </div>
                    <div className="h-2 bg-surface2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${v / max * 100}%`, background: PASTEL[i % PASTEL.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
