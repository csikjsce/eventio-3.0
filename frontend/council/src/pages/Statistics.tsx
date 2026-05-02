import { useMemo, useState, useContext } from 'react';
import UserDataContext from '../contexts/UserDataContext';
import EventsDataContext from '../contexts/EventsDataContext';
import axios from 'axios';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, Legend,
  XAxis, YAxis, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { DocumentDownload } from 'iconsax-react';

type BranchKey = keyof typeof BRANCH_ABBR;

const BRANCH_ABBR: Record<string, string> = {
  Computer_Engineering: 'COMP',
  Information_Technology: 'IT',
  Mechanical: 'Mech',
  Artificial_Intelligence_And_Data_Science: 'AIDS',
  Electronics_And_Computers: 'EXCP',
  Computer_Science_And_Business_Systems: 'CSBS',
  Electronics_And_Telecommunications: 'EXTC',
  Robotics_And_Artificial_Intelligence: 'RAI',
  Computer_And_Communication: 'CCE',
  Electronics: 'ETRX',
  Electronics_VLSI: 'VLSI',
};

// Red-tinted palette for charts
const C = {
  red:    '#dc2626',
  red2:   '#ef4444',
  red3:   '#f87171',
  zinc:   '#52525b',
  muted:  '#71717a',
  branch: ['#dc2626','#f97316','#eab308','#22c55e','#06b6d4','#6366f1','#a855f7','#ec4899','#14b8a6','#8b5cf6','#f43f5e'],
  gender: ['#dc2626','#f97316'],
  year:   ['#dc2626','#f97316','#eab308','#22c55e'],
  bars:   ['#dc2626','#f97316','#eab308','#22c55e','#06b6d4'],
};

interface StatsData {
  eventId: string;
  eventName: string;
  organizerId: string;
  totalParticipants: number;
  branchStats: Record<string, number>;
  genderStats: Record<string, number>;
  yearStats: Record<string, number>;
  dates: string[];
}

// ── Mock data for dev/offline mode ──────────────────────────────────────────
const MOCK_STATS: StatsData[] = [
  {
    eventId: '1',
    eventName: 'HackSphere 2026',
    organizerId: '1',
    totalParticipants: 312,
    branchStats: { Computer_Engineering: 120, Information_Technology: 80, Artificial_Intelligence_And_Data_Science: 60, Electronics_And_Telecommunications: 30, Mechanical: 22 },
    genderStats: { MALE: 210, FEMALE: 102 },
    yearStats: { '2027': 90, '2028': 110, '2029': 75, '2030': 37 },
    dates: ['2026-03-15T09:00:00'],
  },
  {
    eventId: '2',
    eventName: 'UI/UX Workshop',
    organizerId: '1',
    totalParticipants: 85,
    branchStats: { Computer_Engineering: 30, Information_Technology: 25, Computer_Science_And_Business_Systems: 20, Mechanical: 10 },
    genderStats: { MALE: 45, FEMALE: 40 },
    yearStats: { '2027': 20, '2028': 35, '2029': 20, '2030': 10 },
    dates: ['2026-01-20T10:00:00'],
  },
  {
    eventId: '3',
    eventName: 'TechTalks: AI Edition',
    organizerId: '1',
    totalParticipants: 220,
    branchStats: { Computer_Engineering: 75, Information_Technology: 55, Artificial_Intelligence_And_Data_Science: 50, Electronics_And_Computers: 25, Robotics_And_Artificial_Intelligence: 15 },
    genderStats: { MALE: 155, FEMALE: 65 },
    yearStats: { '2027': 60, '2028': 80, '2029': 55, '2030': 25 },
    dates: ['2026-02-10T14:00:00'],
  },
  {
    eventId: '4',
    eventName: 'Robo Rumble',
    organizerId: '1',
    totalParticipants: 140,
    branchStats: { Mechanical: 40, Robotics_And_Artificial_Intelligence: 50, Electronics: 30, Electronics_And_Computers: 20 },
    genderStats: { MALE: 105, FEMALE: 35 },
    yearStats: { '2027': 30, '2028': 50, '2029': 40, '2030': 20 },
    dates: ['2026-04-05T09:00:00'],
  },
  {
    eventId: '5',
    eventName: 'Code Sprint',
    organizerId: '1',
    totalParticipants: 190,
    branchStats: { Computer_Engineering: 80, Information_Technology: 60, Computer_Science_And_Business_Systems: 30, Artificial_Intelligence_And_Data_Science: 20 },
    genderStats: { MALE: 130, FEMALE: 60 },
    yearStats: { '2027': 50, '2028': 70, '2029': 50, '2030': 20 },
    dates: ['2026-05-01T09:00:00'],
  },
];

// ── Tooltip ──────────────────────────────────────────────────────────────────
function DarkTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      {label && <p className="text-zinc-400 text-xs font-fira mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-white text-sm font-fira font-semibold">
          {p.name ? <span className="text-zinc-400 font-normal">{p.name}: </span> : null}
          {p.value}
        </p>
      ))}
    </div>
  );
}

// ── Download ─────────────────────────────────────────────────────────────────
async function downloadAttendance(eventId: string, eventName: string) {
  try {
    const response = await axios.request({
      baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
      url: `/api/v1/event/p/attendance-report/${eventId}`,
      method: 'GET',
      responseType: 'blob',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${eventName}-attendance.pdf`;
    document.body.appendChild(a); a.click();
    a.remove(); window.URL.revokeObjectURL(url);
  } catch {
    alert('Failed to download attendance PDF.');
  }
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`bg-[#0d0d0d] border rounded-xl p-4 ${accent ? 'border-red-600/30 bg-red-600/5' : 'border-white/[0.06]'}`}>
      <p className="text-zinc-500 text-xs font-fira uppercase tracking-wider mb-2">{label}</p>
      <p className="text-white text-2xl font-fira font-bold leading-none">{value ?? '—'}</p>
      {sub && <p className="text-zinc-500 text-xs font-fira mt-1">{sub}</p>}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SH({ children }: { children: React.ReactNode }) {
  return <h3 className="text-white font-fira font-semibold text-sm mb-3">{children}</h3>;
}

// ── Chart card wrapper ────────────────────────────────────────────────────────
function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-5 ${className}`}>
      <h3 className="text-white font-fira font-semibold text-sm mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Statistics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'comparison'>('overview');
  const [selectedEvents, setSelectedEvents] = useState<StatsData[]>([]);
  const [drillEvent, setDrillEvent] = useState<StatsData | null>(null);
  const [statsData, setStatsData] = useState<StatsData[]>(MOCK_STATS);
  const { userData } = useContext(UserDataContext);
  const { eventsList } = useContext(EventsDataContext);

  // Try live API; fall back to mock
  useMemo(() => {
    if (!userData) return;
    axios.request<{ data: StatsData[] }>({
      baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
      url: '/api/v1/event/p/stats',
      method: 'GET',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
    }).then((res) => {
      const filtered = res.data.data.filter((e) => e.organizerId === String(userData.id));
      if (filtered.length) setStatsData(filtered);
    }).catch(() => { /* keep mock */ });
  }, [userData]);

  // ── Derived metrics ────────────────────────────────────────────────────────
  const insights = useMemo(() => {
    if (!statsData.length) return null;
    const total = statsData.reduce((s, e) => s + e.totalParticipants, 0);
    const avg = Math.round(total / statsData.length);
    const best = statsData.reduce((m, e) => e.totalParticipants > m.totalParticipants ? e : m, statsData[0]);
    const branchTotals: Record<string, number> = {};
    statsData.forEach(e => Object.entries(e.branchStats).forEach(([b, c]) => { branchTotals[b] = (branchTotals[b] || 0) + c; }));
    const topBranchRaw = Object.entries(branchTotals).reduce((m, [b, c]) => c > m[1] ? [b, c] : m, ['', 0]);
    const topBranch = BRANCH_ABBR[topBranchRaw[0] as BranchKey] || topBranchRaw[0];
    const totalMale = statsData.reduce((s, e) => s + (e.genderStats['MALE'] || 0), 0);
    const totalFemale = statsData.reduce((s, e) => s + (e.genderStats['FEMALE'] || 0), 0);
    const genderRatio = totalFemale > 0 ? `${(totalMale / totalFemale).toFixed(1)}:1` : `${totalMale}:0`;
    const completedCount = eventsList.filter(e => e.state === 'COMPLETED').length;
    return { total, avg, best, topBranch, genderRatio, completedCount };
  }, [statsData, eventsList]);

  const allBranchData = useMemo(() => {
    const agg: Record<string, number> = {};
    statsData.forEach(e => Object.entries(e.branchStats).forEach(([b, c]) => {
      const k = BRANCH_ABBR[b as BranchKey] || b;
      agg[k] = (agg[k] || 0) + c;
    }));
    return Object.entries(agg).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [statsData]);

  const allGenderData = useMemo(() => {
    const agg: Record<string, number> = {};
    statsData.forEach(e => Object.entries(e.genderStats).forEach(([g, c]) => { agg[g] = (agg[g] || 0) + c; }));
    return Object.entries(agg).map(([name, value]) => ({ name, value }));
  }, [statsData]);

  const trendData = useMemo(() => {
    return [...statsData].sort((a, b) => new Date(a.dates[0]).getTime() - new Date(b.dates[0]).getTime())
      .map(e => ({
        name: e.eventName,
        date: new Date(e.dates[0]).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        participants: e.totalParticipants,
      }));
  }, [statsData]);

  const participantsBarData = useMemo(() => statsData.map(e => ({ name: e.eventName, value: e.totalParticipants })), [statsData]);

  const yearData = useMemo(() => {
    const agg: Record<string, number> = {};
    const refYear = statsData[0] ? new Date(statsData[0].dates[0]).getFullYear() : new Date().getFullYear();
    statsData.forEach(e => Object.entries(e.yearStats).forEach(([yr, c]) => {
      const diff = parseInt(yr) - refYear;
      const label = diff === 4 ? 'FY' : diff === 3 ? 'SY' : diff === 2 ? 'TY' : diff === 1 ? 'LY' : null;
      if (label) agg[label] = (agg[label] || 0) + c;
    }));
    const order = { FY: 1, SY: 2, TY: 3, LY: 4 };
    return Object.entries(agg).map(([year, count]) => ({ year, count }))
      .sort((a, b) => (order[a.year as keyof typeof order] || 9) - (order[b.year as keyof typeof order] || 9));
  }, [statsData]);

  const comparisonData = useMemo(() => [{
    metric: 'Participants',
    ...selectedEvents.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.eventName]: e.totalParticipants }), {}),
  }], [selectedEvents]);

  const compBranchData = useMemo(() => {
    const agg: Record<string, number> = {};
    selectedEvents.forEach(e => Object.entries(e.branchStats).forEach(([b, c]) => {
      const k = BRANCH_ABBR[b as BranchKey] || b;
      agg[k] = (agg[k] || 0) + c;
    }));
    return Object.entries(agg).map(([branch, count]) => ({ branch, count }));
  }, [selectedEvents]);

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'Per Event' },
    { id: 'comparison', label: 'Comparison' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#080808] px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white font-marcellus text-2xl mb-1">Council Statistics</h1>
        <p className="text-zinc-500 text-sm font-fira">Analytics across all events organised by your council.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#0d0d0d] border border-white/[0.06] rounded-xl w-fit mb-8">
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={() => { setActiveTab(t.id); setDrillEvent(null); }}
            className={`px-5 py-2 rounded-lg text-sm font-fira transition-all ${activeTab === t.id ? 'bg-red-600 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && insights && (
        <div className="space-y-8">
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total Events" value={insights.total > 0 ? statsData.length : 0} accent />
            <StatCard label="Total Participants" value={insights.total.toLocaleString()} />
            <StatCard label="Avg. per Event" value={insights.avg} />
            <StatCard label="Best Event" value={insights.best.eventName} sub={`${insights.best.totalParticipants} participants`} />
            <StatCard label="Top Branch" value={insights.topBranch} />
            <StatCard label="M:F Ratio" value={insights.genderRatio} />
          </div>

          {/* Trend + Participation bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Participation Trend" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData}>
                  <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Line type="monotone" dataKey="participants" stroke={C.red} strokeWidth={2.5}
                    dot={{ fill: C.red, r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} name="Participants" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Grid: bar, pie, pie, year */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Participants per Event">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={participantsBarData} barSize={24}>
                  <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Participants">
                    {participantsBarData.map((_, i) => <Cell key={i} fill={C.bars[i % C.bars.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* legend below bar */}
              <div className="flex flex-wrap gap-2 mt-3">
                {participantsBarData.map((d, i) => (
                  <span key={d.name} className="flex items-center gap-1 text-xs font-fira text-zinc-400">
                    <span className="w-2 h-2 rounded-sm inline-block" style={{ background: C.bars[i % C.bars.length] }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Branch Distribution">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={allBranchData} cx="50%" cy="45%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {allBranchData.map((_, i) => <Cell key={i} fill={C.branch[i % C.branch.length]} />)}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Gender Distribution">
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie data={allGenderData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                      {allGenderData.map((_, i) => <Cell key={i} fill={C.gender[i % C.gender.length]} />)}
                    </Pie>
                    <Tooltip content={<DarkTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-3">
                  {allGenderData.map((d, i) => {
                    const total = allGenderData.reduce((s, x) => s + x.value, 0);
                    return (
                      <div key={d.name}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-3 h-3 rounded-full inline-block" style={{ background: C.gender[i] }} />
                          <span className="text-zinc-400 text-xs font-fira">{d.name}</span>
                        </div>
                        <p className="text-white text-xl font-fira font-bold">{d.value.toLocaleString()}</p>
                        <p className="text-zinc-500 text-xs font-fira">{total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Academic Year Distribution">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={yearData} barSize={36}>
                  <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 12, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Students">
                    {yearData.map((_, i) => <Cell key={i} fill={C.year[i % C.year.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-zinc-600 text-xs font-fira mt-2">FY = First Year · SY = Second · TY = Third · LY = Final</p>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ── Per-Event ────────────────────────────────────────────────────── */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {!drillEvent ? (
            <>
              <p className="text-zinc-500 text-sm font-fira">Click an event to see its detailed breakdown.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {statsData.map((ev) => (
                  <button key={ev.eventId} type="button" onClick={() => setDrillEvent(ev)}
                    className="bg-[#0d0d0d] border border-white/[0.06] hover:border-red-600/30 rounded-xl p-4 text-left transition-all group">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white font-fira font-semibold text-sm group-hover:text-red-400 transition-colors">{ev.eventName}</p>
                      <button type="button" onClick={(e) => { e.stopPropagation(); downloadAttendance(ev.eventId, ev.eventName); }}
                        className="shrink-0 text-zinc-600 hover:text-red-400 transition-colors" title="Download Attendance">
                        <DocumentDownload size={16} />
                      </button>
                    </div>
                    <p className="text-zinc-500 text-xs font-fira mt-1">
                      {new Date(ev.dates[0]).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-red-500 text-2xl font-fira font-bold">{ev.totalParticipants}</p>
                        <p className="text-zinc-500 text-xs font-fira">participants</p>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-300 text-sm font-fira font-semibold">
                          {ev.genderStats['MALE'] ?? 0}M / {ev.genderStats['FEMALE'] ?? 0}F
                        </p>
                        <p className="text-zinc-600 text-xs font-fira">gender split</p>
                      </div>
                    </div>
                    {/* mini branch bar */}
                    <div className="mt-3 flex gap-0.5 h-1.5 rounded-full overflow-hidden">
                      {Object.entries(ev.branchStats).slice(0, 8).map(([b, c], i) => (
                        <div key={b} style={{ flex: c, background: C.branch[i % C.branch.length] }} title={BRANCH_ABBR[b as BranchKey] || b} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <EventDrillDown event={drillEvent} onBack={() => setDrillEvent(null)} />
          )}
        </div>
      )}

      {/* ── Comparison ──────────────────────────────────────────────────── */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-sm font-fira">
              Select events to compare.{' '}
              {selectedEvents.length > 0 && <span className="text-white font-semibold">{selectedEvents.length} selected</span>}
            </p>
            {selectedEvents.length > 0 && (
              <button type="button"
                onClick={() => selectedEvents.forEach(e => downloadAttendance(e.eventId, e.eventName))}
                className="flex items-center gap-2 px-4 py-2 bg-[#0d0d0d] border border-white/[0.06] hover:border-red-600/30 text-zinc-300 hover:text-white text-sm font-fira rounded-lg transition-all">
                <DocumentDownload size={16} />
                Download Selected Attendance
              </button>
            )}
          </div>

          {/* Event picker */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {statsData.map((ev) => {
              const sel = selectedEvents.includes(ev);
              return (
                <button key={ev.eventId} type="button" onClick={() => setSelectedEvents(prev => sel ? prev.filter(e => e !== ev) : [...prev, ev])}
                  className={`p-3 rounded-xl border text-left transition-all ${sel ? 'border-red-600/40 bg-red-600/10' : 'border-white/[0.06] bg-[#0d0d0d] hover:border-white/15'}`}>
                  <div className={`w-3 h-3 rounded-full border-2 mb-2 ${sel ? 'bg-red-500 border-red-500' : 'border-zinc-600'}`} />
                  <p className={`text-sm font-fira font-semibold leading-tight ${sel ? 'text-white' : 'text-zinc-400'}`}>{ev.eventName}</p>
                  <p className="text-zinc-600 text-xs font-fira mt-1">{ev.totalParticipants} participants</p>
                </button>
              );
            })}
          </div>

          {selectedEvents.length > 1 && (
            <div className="space-y-5">
              {/* Participants bar */}
              <ChartCard title="Participant Count Comparison">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={comparisonData} barSize={32}>
                    <XAxis dataKey="metric" tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ fontFamily: 'Fira Sans', fontSize: 12, color: '#a1a1aa' }} />
                    {selectedEvents.map((e, i) => <Bar key={e.eventId} dataKey={e.eventName} fill={C.bars[i % C.bars.length]} radius={[4, 4, 0, 0]} />)}
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Branch radar */}
              <ChartCard title="Combined Branch Distribution (Selected Events)">
                <ResponsiveContainer width="100%" height={340}>
                  <RadarChart data={compBranchData}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="branch" tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Fira Sans' }} />
                    <PolarRadiusAxis angle={30} tick={{ fill: '#52525b', fontSize: 10 }} />
                    <Radar name="Students" dataKey="count" stroke={C.red} fill={C.red} fillOpacity={0.25} />
                    <Tooltip content={<DarkTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Side-by-side gender */}
              <ChartCard title="Gender Split Comparison">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedEvents.map((e, i) => {
                    const m = e.genderStats['MALE'] || 0;
                    const f = e.genderStats['FEMALE'] || 0;
                    const total = m + f;
                    const malePct = total > 0 ? (m / total) * 100 : 50;
                    return (
                      <div key={e.eventId} className="bg-[#111] rounded-xl p-3 border border-white/[0.06]">
                        <p className="text-white text-xs font-fira font-semibold leading-tight mb-3 line-clamp-2">{e.eventName}</p>
                        <div className="h-2 rounded-full overflow-hidden flex gap-0.5">
                          <div style={{ width: `${malePct}%`, background: C.bars[i % C.bars.length] }} className="h-full rounded-l-full" />
                          <div style={{ width: `${100 - malePct}%`, background: '#f97316' }} className="h-full rounded-r-full" />
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-zinc-400 text-[10px] font-fira">{m}M</span>
                          <span className="text-zinc-400 text-[10px] font-fira">{f}F</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ChartCard>
            </div>
          )}

          {selectedEvents.length === 1 && (
            <div className="text-center py-12 text-zinc-600 font-fira text-sm">
              Select at least 2 events to compare
            </div>
          )}
          {selectedEvents.length === 0 && (
            <div className="text-center py-12 text-zinc-600 font-fira text-sm">
              Select events above to start comparing
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Per-event drill-down ────────────────────────────────────────────────────
function EventDrillDown({ event, onBack }: { event: StatsData; onBack: () => void }) {
  const branchData = Object.entries(event.branchStats).map(([b, v]) => ({
    name: BRANCH_ABBR[b as BranchKey] || b, value: v,
  })).sort((a, b) => b.value - a.value);

  const genderData = Object.entries(event.genderStats).map(([name, value]) => ({ name, value }));

  const refYear = new Date(event.dates[0]).getFullYear();
  const yearData = Object.entries(event.yearStats).map(([yr, c]) => {
    const diff = parseInt(yr) - refYear;
    const label = diff === 4 ? 'FY' : diff === 3 ? 'SY' : diff === 2 ? 'TY' : diff === 1 ? 'LY' : 'Other';
    return { year: label, count: c };
  }).filter(d => d.year !== 'Other')
    .sort((a, b) => (['FY','SY','TY','LY'].indexOf(a.year)) - (['FY','SY','TY','LY'].indexOf(b.year)));

  const m = event.genderStats['MALE'] || 0;
  const f = event.genderStats['FEMALE'] || 0;
  const total = event.totalParticipants;

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <button type="button" onClick={onBack} className="mt-0.5 px-3 py-1.5 text-xs font-fira text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all">
          ← All Events
        </button>
        <div>
          <h2 className="text-white font-marcellus text-lg leading-tight">{event.eventName}</h2>
          <p className="text-zinc-500 text-xs font-fira mt-0.5">
            {new Date(event.dates[0]).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button type="button" onClick={() => downloadAttendance(event.eventId, event.eventName)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#0d0d0d] border border-white/[0.06] hover:border-red-600/30 text-zinc-300 hover:text-white text-sm font-fira rounded-lg transition-all">
          <DocumentDownload size={15} />
          Download Attendance
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Participants" value={total.toLocaleString()} accent />
        <StatCard label="Male" value={m} sub={`${total > 0 ? ((m / total) * 100).toFixed(1) : 0}%`} />
        <StatCard label="Female" value={f} sub={`${total > 0 ? ((f / total) * 100).toFixed(1) : 0}%`} />
        <StatCard label="Top Branch" value={branchData[0]?.name || '—'} sub={branchData[0] ? `${branchData[0].value} students` : ''} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Branch Breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={branchData} layout="vertical" barSize={18}>
              <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={50} tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Students">
                {branchData.map((_, i) => <Cell key={i} fill={C.branch[i % C.branch.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gender Split">
          <div className="flex items-center justify-center h-full gap-8 py-4">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}>
                  {genderData.map((_, i) => <Cell key={i} fill={C.gender[i % C.gender.length]} />)}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-4">
              {genderData.map((d, i) => (
                <div key={d.name}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full" style={{ background: C.gender[i] }} />
                    <span className="text-zinc-400 text-xs font-fira">{d.name}</span>
                  </div>
                  <p className="text-white text-2xl font-fira font-bold">{d.value}</p>
                  <p className="text-zinc-500 text-xs font-fira">{total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%</p>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Academic Year Distribution" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={yearData} barSize={48}>
              <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 13, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Students">
                {yearData.map((_, i) => <Cell key={i} fill={C.year[i % C.year.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-zinc-600 text-xs font-fira mt-2">FY = First Year · SY = Second · TY = Third · LY = Final</p>
        </ChartCard>
      </div>
    </div>
  );
}
