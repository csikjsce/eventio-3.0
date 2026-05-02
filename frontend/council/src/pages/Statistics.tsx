import { useMemo, useState, useContext, useEffect, useRef } from 'react';
import UserDataContext from '../contexts/UserDataContext';
import EventsDataContext from '../contexts/EventsDataContext';
import axios from 'axios';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  ResponsiveContainer, Tooltip, Legend,
  XAxis, YAxis,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { DocumentDownload } from 'iconsax-react';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Download, Search, CalendarDays, Users, BarChart3, Heart } from 'lucide-react';

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

const C = {
  red:    '#dc2626',
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

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_STATS: StatsData[] = [
  {
    eventId: '1', eventName: 'HackSphere 2026', organizerId: '1', totalParticipants: 312,
    branchStats: { Computer_Engineering: 120, Information_Technology: 80, Artificial_Intelligence_And_Data_Science: 60, Electronics_And_Telecommunications: 30, Mechanical: 22 },
    genderStats: { MALE: 210, FEMALE: 102 },
    yearStats: { '2027': 90, '2028': 110, '2029': 75, '2030': 37 },
    dates: ['2026-03-15T09:00:00'],
  },
  {
    eventId: '2', eventName: 'UI/UX Workshop', organizerId: '1', totalParticipants: 85,
    branchStats: { Computer_Engineering: 30, Information_Technology: 25, Computer_Science_And_Business_Systems: 20, Mechanical: 10 },
    genderStats: { MALE: 45, FEMALE: 40 },
    yearStats: { '2027': 20, '2028': 35, '2029': 20, '2030': 10 },
    dates: ['2026-01-20T10:00:00'],
  },
  {
    eventId: '3', eventName: 'TechTalks: AI Edition', organizerId: '1', totalParticipants: 220,
    branchStats: { Computer_Engineering: 75, Information_Technology: 55, Artificial_Intelligence_And_Data_Science: 50, Electronics_And_Computers: 25, Robotics_And_Artificial_Intelligence: 15 },
    genderStats: { MALE: 155, FEMALE: 65 },
    yearStats: { '2027': 60, '2028': 80, '2029': 55, '2030': 25 },
    dates: ['2026-02-10T14:00:00'],
  },
  {
    eventId: '4', eventName: 'Robo Rumble', organizerId: '1', totalParticipants: 140,
    branchStats: { Mechanical: 40, Robotics_And_Artificial_Intelligence: 50, Electronics: 30, Electronics_And_Computers: 20 },
    genderStats: { MALE: 105, FEMALE: 35 },
    yearStats: { '2027': 30, '2028': 50, '2029': 40, '2030': 20 },
    dates: ['2026-04-05T09:00:00'],
  },
  {
    eventId: '5', eventName: 'Code Sprint', organizerId: '1', totalParticipants: 190,
    branchStats: { Computer_Engineering: 80, Information_Technology: 60, Computer_Science_And_Business_Systems: 30, Artificial_Intelligence_And_Data_Science: 20 },
    genderStats: { MALE: 130, FEMALE: 60 },
    yearStats: { '2027': 50, '2028': 70, '2029': 50, '2030': 20 },
    dates: ['2026-05-01T09:00:00'],
  },
];

// ── Animated counter ──────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1100): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    setValue(0);
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function DarkTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#252527] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      {label && <p className="text-zinc-400 text-xs font-fira mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-white text-sm font-fira font-semibold">
          {p.name ? <span className="text-zinc-400 font-normal">{p.name}: </span> : null}
          {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

// ── CSV export ────────────────────────────────────────────────────────────────
function exportToCSV(data: StatsData[]) {
  const rows = [
    ['Event Name', 'Date', 'Total Participants', 'Male', 'Female', 'Top Branch', 'Branches Reached'],
    ...data.map(e => {
      const top = Object.entries(e.branchStats).sort((a, b) => b[1] - a[1])[0];
      return [
        e.eventName,
        new Date(e.dates[0]).toLocaleDateString('en-IN'),
        e.totalParticipants,
        e.genderStats['MALE'] || 0,
        e.genderStats['FEMALE'] || 0,
        top ? (BRANCH_ABBR[top[0] as BranchKey] || top[0]) : '-',
        Object.keys(e.branchStats).length,
      ];
    }),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'council-stats.csv';
  document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}

// ── Download attendance PDF ───────────────────────────────────────────────────
async function downloadAttendance(eventId: string, eventName: string) {
  try {
    const res = await axios.request({
      baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
      url: `/api/v1/event/p/attendance-report/${eventId}`,
      method: 'GET', responseType: 'blob',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
    });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url; a.download = `${eventName}-attendance.pdf`;
    document.body.appendChild(a); a.click();
    a.remove(); window.URL.revokeObjectURL(url);
  } catch { alert('Failed to download attendance PDF.'); }
}

// ── Stat card (animated) ──────────────────────────────────────────────────────
interface TrendBadge { direction: 'up' | 'down' | 'neutral'; text: string }

function StatCard({ label, value, sub, accent, trend, icon: Icon }: {
  label: string; value: string | number; sub?: string; accent?: boolean; trend?: TrendBadge;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const isNum = typeof value === 'number';
  const animated = useCountUp(isNum ? (value as number) : 0);
  return (
    <div className={`bg-[#1c1c1e] border rounded-2xl p-5 ${accent ? 'border-red-600/30' : 'border-white/[0.06]'}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-zinc-500 text-[11px] font-fira uppercase tracking-widest">{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${accent ? 'bg-red-600/15 text-red-400' : 'bg-zinc-800/60 text-zinc-500'}`}>
            <Icon size={15} />
          </div>
        )}
      </div>
      <p className={`font-fira font-bold leading-tight break-words mb-3 ${
        typeof value === 'string' && value.length > 10 ? 'text-xl' : 'text-3xl'
      } ${accent ? 'text-red-400' : 'text-white'}`}>
        {isNum ? animated.toLocaleString() : (value ?? '-')}
      </p>
      <div className="flex items-center gap-2 flex-wrap min-h-[18px]">
        {sub && <p className="text-zinc-500 text-xs font-fira">{sub}</p>}
        {trend && (
          <span className={`flex items-center gap-1 text-[11px] font-fira font-semibold px-2 py-0.5 rounded-full ml-auto ${
            trend.direction === 'up' ? 'text-emerald-400 bg-emerald-400/10' :
            trend.direction === 'down' ? 'text-red-400 bg-red-400/10' :
            'text-zinc-400 bg-zinc-800/60'}`}>
            {trend.direction === 'up' ? <TrendingUp size={10} /> : trend.direction === 'down' ? <TrendingDown size={10} /> : <Minus size={10} />}
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Chart card ────────────────────────────────────────────────────────────────
function ChartCard({ title, children, className = '', actions }: {
  title: string; children: React.ReactNode; className?: string; actions?: React.ReactNode;
}) {
  return (
    <div className={`bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="text-white font-fira font-semibold text-sm">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  );
}

// ── Small segmented control ───────────────────────────────────────────────────
function SegControl({ options, value, onChange }: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-0.5 bg-[#1c1c1e] border border-white/[0.06] rounded-lg p-0.5">
      {options.map(o => (
        <button key={o.id} type="button" onClick={() => onChange(o.id)}
          className={`px-2.5 py-1 text-[11px] font-fira rounded-md transition-all ${value === o.id ? 'bg-red-600/80 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'events' | 'comparison';
type SortOrder = 'participants-desc' | 'participants-asc' | 'date-desc' | 'date-asc';

// ── Main component ────────────────────────────────────────────────────────────
export default function Statistics() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedEvents, setSelectedEvents] = useState<StatsData[]>([]);
  const [drillEvent, setDrillEvent] = useState<StatsData | null>(null);
  const [statsData, setStatsData] = useState<StatsData[]>(MOCK_STATS);
  const [branchFilter, setBranchFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('participants-desc');
  const [search, setSearch] = useState('');
  const [branchChartType, setBranchChartType] = useState<'pie' | 'bar'>('pie');

  const { userData } = useContext(UserDataContext);
  const { eventsList } = useContext(EventsDataContext);

  useEffect(() => {
    if (!userData) return;
    axios.request<{ data: StatsData[] }>({
      baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
      url: '/api/v1/event/p/stats', method: 'GET',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
    }).then(res => {
      const filtered = res.data.data.filter(e => e.organizerId === String(userData.id));
      if (filtered.length) setStatsData(filtered);
    }).catch(() => {});
  }, [userData]);

  // ── Derived data ──────────────────────────────────────────────────────────
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

  const trendData = useMemo(() =>
    [...statsData]
      .sort((a, b) => new Date(a.dates[0]).getTime() - new Date(b.dates[0]).getTime())
      .map(e => ({
        name: e.eventName,
        date: new Date(e.dates[0]).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        participants: e.totalParticipants,
      })),
  [statsData]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { label: string; count: number; ts: number }> = {};
    statsData.forEach(e => {
      const d = new Date(e.dates[0]);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      if (!months[key]) months[key] = { label, count: 0, ts: d.getTime() };
      months[key].count += e.totalParticipants;
    });
    return Object.values(months).sort((a, b) => a.ts - b.ts).map(({ label, count }) => ({ month: label, count }));
  }, [statsData]);

  const participantsBarData = useMemo(() =>
    statsData.map(e => ({ name: e.eventName, value: e.totalParticipants })),
  [statsData]);

  const yearData = useMemo(() => {
    const agg: Record<string, number> = {};
    const refYear = statsData[0] ? new Date(statsData[0].dates[0]).getFullYear() : new Date().getFullYear();
    statsData.forEach(e => Object.entries(e.yearStats).forEach(([yr, c]) => {
      const diff = parseInt(yr) - refYear;
      const label = diff === 4 ? 'FY' : diff === 3 ? 'SY' : diff === 2 ? 'TY' : diff === 1 ? 'LY' : null;
      if (label) agg[label] = (agg[label] || 0) + c;
    }));
    const order = { FY: 1, SY: 2, TY: 3, LY: 4 };
    return Object.entries(agg)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => (order[a.year as keyof typeof order] || 9) - (order[b.year as keyof typeof order] || 9));
  }, [statsData]);

  const insights = useMemo(() => {
    if (!statsData.length) return null;
    const total = statsData.reduce((s, e) => s + e.totalParticipants, 0);
    const avg = Math.round(total / statsData.length);
    const best = statsData.reduce((m, e) => e.totalParticipants > m.totalParticipants ? e : m, statsData[0]);
    const totalFemale = statsData.reduce((s, e) => s + (e.genderStats['FEMALE'] || 0), 0);
    const femalePct = total > 0 ? Math.round((totalFemale / total) * 100) : 0;
    const completedCount = eventsList.filter(e => e.state === 'COMPLETED').length;
    const sorted = [...statsData].sort((a, b) => new Date(a.dates[0]).getTime() - new Date(b.dates[0]).getTime());
    const growth = sorted.length >= 2 && sorted[0].totalParticipants > 0
      ? Math.round(((sorted[sorted.length - 1].totalParticipants - sorted[0].totalParticipants) / sorted[0].totalParticipants) * 100)
      : null;
    const sum = allBranchData.reduce((s, b) => s + b.value, 0);
    const entropy = allBranchData.reduce((s, b) => {
      const p = b.value / sum;
      return s - (p > 0 ? p * Math.log2(p) : 0);
    }, 0);
    const maxEntropy = Math.log2(Math.max(allBranchData.length, 1));
    const diversityScore = sum > 0 && maxEntropy > 0 ? Math.round((entropy / maxEntropy) * 100) : 0;
    return { total, avg, best, femalePct, totalFemale, completedCount, growth, diversityScore, uniqueBranches: allBranchData.length };
  }, [statsData, eventsList, allBranchData]);

  // Branch filter — which events contain that branch
  const branchFilteredEvents = useMemo(() => {
    if (!branchFilter) return [];
    return statsData
      .filter(e => Object.entries(e.branchStats).some(([b]) => (BRANCH_ABBR[b as BranchKey] || b) === branchFilter))
      .map(e => ({
        event: e,
        count: Object.entries(e.branchStats)
          .find(([b]) => (BRANCH_ABBR[b as BranchKey] || b) === branchFilter)?.[1] || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [branchFilter, statsData]);

  // Sorted + filtered events for Per-Event tab
  const filteredSortedEvents = useMemo(() => {
    let ev = [...statsData].filter(e => e.eventName.toLowerCase().includes(search.toLowerCase()));
    switch (sortOrder) {
      case 'participants-desc': return ev.sort((a, b) => b.totalParticipants - a.totalParticipants);
      case 'participants-asc':  return ev.sort((a, b) => a.totalParticipants - b.totalParticipants);
      case 'date-desc': return ev.sort((a, b) => new Date(b.dates[0]).getTime() - new Date(a.dates[0]).getTime());
      case 'date-asc':  return ev.sort((a, b) => new Date(a.dates[0]).getTime() - new Date(b.dates[0]).getTime());
      default: return ev;
    }
  }, [statsData, search, sortOrder]);

  // Comparison tab derived data
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

  const compYearData = useMemo(() => {
    return ['FY', 'SY', 'TY', 'LY'].map(yr => {
      const entry: Record<string, string | number> = { year: yr };
      selectedEvents.forEach(ev => {
        const refYear = new Date(ev.dates[0]).getFullYear();
        let total = 0;
        Object.entries(ev.yearStats).forEach(([gradYr, c]) => {
          const diff = parseInt(gradYr) - refYear;
          const label = diff === 4 ? 'FY' : diff === 3 ? 'SY' : diff === 2 ? 'TY' : diff === 1 ? 'LY' : null;
          if (label === yr) total += c;
        });
        entry[ev.eventName] = total;
      });
      return entry;
    });
  }, [selectedEvents]);

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'Per Event' },
    { id: 'comparison', label: 'Comparison' },
  ];

  const gotoTab = (tab: Tab) => { setActiveTab(tab); setDrillEvent(null); };

  return (
    <div className="min-h-screen bg-[#121214] px-8 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h1 className="text-white font-marcellus text-2xl mb-1">Council Statistics</h1>
          <p className="text-zinc-500 text-sm font-fira">Analytics across all events organised by your council.</p>
        </div>
        <button type="button" onClick={() => exportToCSV(statsData)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1c1c1e] border border-white/[0.06] hover:border-white/15 text-zinc-400 hover:text-white text-xs font-fira rounded-lg transition-all">
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {/* Quick-stats bar */}
      {insights && (
        <p className="text-xs font-fira text-zinc-500 mb-8">
          <span className="text-white font-semibold">{statsData.length} Events Tracked</span>
          <span className="mx-2 text-zinc-700">·</span>
          <span className="text-white font-semibold">{insights.total.toLocaleString()} Total Participants</span>
          <span className="mx-2 text-zinc-700">·</span>
          Best: <span className="text-red-400 font-semibold">{insights.best.eventName}</span>
          <span className="text-zinc-600 ml-1">({insights.best.totalParticipants} participants)</span>
        </p>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#1c1c1e] border border-white/[0.06] rounded-xl w-fit mb-8">
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={() => gotoTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-fira transition-all ${activeTab === t.id ? 'bg-red-600 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW ──────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && insights && (
        <div className="space-y-6">

          {/* 4 KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Events Tracked" value={statsData.length} sub="completed events" accent icon={CalendarDays} />
            <StatCard label="Total Participants" value={insights.total} sub={`across ${statsData.length} events`} icon={Users} />
            <StatCard label="Avg / Event" value={insights.avg} sub="participants per event"
              trend={insights.growth !== null ? { direction: insights.growth >= 0 ? 'up' : 'down', text: `${Math.abs(insights.growth)}% growth` } : undefined}
              icon={BarChart3} />
            <StatCard label="Female Inclusion" value={`${insights.femalePct}%`} sub={`${insights.totalFemale} registrants`}
              trend={{ direction: insights.femalePct >= 35 ? 'up' : insights.femalePct >= 20 ? 'neutral' : 'down', text: insights.femalePct >= 35 ? 'Healthy' : 'Needs work' }}
              icon={Heart} />
          </div>

          {/* Main: events table (left) + performance panel (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Events table */}
            <div className="lg:col-span-3 bg-[#1c1c1e] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <h3 className="text-white font-fira font-semibold text-sm">Events Overview</h3>
                <span className="text-zinc-500 text-[11px] font-fira">
                  Last updated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      <th className="text-left px-5 py-3 text-zinc-500 text-[11px] font-fira font-normal uppercase tracking-wide">Event Name</th>
                      <th className="text-left px-5 py-3 text-zinc-500 text-[11px] font-fira font-normal uppercase tracking-wide">Date</th>
                      <th className="text-left px-5 py-3 text-zinc-500 text-[11px] font-fira font-normal uppercase tracking-wide">Participants</th>
                      <th className="text-left px-5 py-3 text-zinc-500 text-[11px] font-fira font-normal uppercase tracking-wide">Branches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const maxP = Math.max(...statsData.map(e => e.totalParticipants), 1);
                      return [...statsData].sort((a, b) => b.totalParticipants - a.totalParticipants).map(ev => (
                        <tr key={ev.eventId}
                          onClick={() => { setDrillEvent(ev); gotoTab('events'); }}
                          className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors group last:border-0">
                          <td className="px-5 py-3.5">
                            <p className="text-white text-sm font-fira font-semibold group-hover:text-red-400 transition-colors leading-tight">{ev.eventName}</p>
                          </td>
                          <td className="px-5 py-3.5 text-zinc-400 text-sm font-fira whitespace-nowrap">
                            {new Date(ev.dates[0]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <span className="text-white text-sm font-fira font-bold w-10 shrink-0">{ev.totalParticipants}</span>
                              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden min-w-[60px]">
                                <div className="h-full rounded-full bg-red-600" style={{ width: `${(ev.totalParticipants / maxP) * 100}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-zinc-400 text-sm font-fira">{Object.keys(ev.branchStats).length}</span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance panel */}
            <div className="lg:col-span-2 bg-[#1c1c1e] border border-white/[0.06] rounded-xl p-5 flex flex-col">
              <h3 className="text-white font-fira font-semibold text-sm mb-1">Performance</h3>
              <p className="text-zinc-500 text-[11px] font-fira mb-4">avg participants per event</p>
              <p className="text-white font-fira font-bold mb-1" style={{ fontSize: '3.25rem', lineHeight: 1 }}>{insights.avg}</p>
              {insights.growth !== null && (
                <p className={`text-sm font-fira font-semibold mb-5 ${insights.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {insights.growth >= 0 ? '+' : ''}{insights.growth}% vs first event
                </p>
              )}
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={participantsBarData} barSize={22} barCategoryGap="20%">
                    <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={<DarkTooltip />} />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]} name="Participants">
                      {participantsBarData.map((d, i) => {
                        const max = Math.max(...participantsBarData.map(e => e.value));
                        return <Cell key={i} fill={d.value === max ? '#dc2626' : '#3f3f46'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
                {participantsBarData.map(d => {
                  const max = Math.max(...participantsBarData.map(e => e.value));
                  return (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-sm shrink-0 ${d.value === max ? 'bg-red-600' : 'bg-zinc-700'}`} />
                      <button type="button"
                        onClick={() => { const ev = statsData.find(e => e.eventName === d.name); if (ev) { setDrillEvent(ev); gotoTab('events'); } }}
                        className="text-zinc-400 text-[11px] font-fira truncate flex-1 text-left hover:text-white transition-colors">{d.name}</button>
                      <span className={`text-[11px] font-fira font-bold shrink-0 ${d.value === max ? 'text-red-400' : 'text-zinc-300'}`}>{d.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom 3-col: Branch progress bars + Gender donut + Year bars */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <ChartCard title="Branch Distribution">
              <div className="space-y-3">
                {allBranchData.map((d, i) => {
                  const max = allBranchData[0]?.value || 1;
                  const pct = (d.value / max) * 100;
                  return (
                    <div key={d.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-zinc-300 text-xs font-fira">{d.name}</span>
                        <span className="text-white text-xs font-fira font-bold">{d.value}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: C.branch[i % C.branch.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartCard>

            <ChartCard title="Gender Distribution">
              <div className="flex flex-col items-center gap-3">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={allGenderData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={4}>
                      {allGenderData.map((_, i) => <Cell key={i} fill={C.gender[i % C.gender.length]} />)}
                    </Pie>
                    <Tooltip content={<DarkTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-8 justify-center">
                  {allGenderData.map((d, i) => {
                    const tot = allGenderData.reduce((s, x) => s + x.value, 0);
                    return (
                      <div key={d.name} className="text-center">
                        <div className="flex items-center gap-1.5 justify-center mb-1">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: C.gender[i] }} />
                          <span className="text-zinc-400 text-xs font-fira">{d.name}</span>
                        </div>
                        <p className="text-white text-xl font-fira font-bold">{d.value.toLocaleString()}</p>
                        <p className="text-zinc-500 text-[11px] font-fira">{tot > 0 ? ((d.value / tot) * 100).toFixed(1) : 0}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Academic Year">
              <div className="space-y-3.5">
                {yearData.map((d, i) => {
                  const tot = yearData.reduce((s, y) => s + y.count, 0);
                  const pct = tot > 0 ? (d.count / tot) * 100 : 0;
                  return (
                    <div key={d.year}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: C.year[i] }} />
                          <span className="text-zinc-300 text-sm font-fira font-semibold">{d.year}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white text-sm font-fira font-bold">{d.count}</span>
                          <span className="text-zinc-500 text-xs font-fira w-8 text-right">{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: C.year[i] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-zinc-700 text-[11px] font-fira mt-4">FY = First Year Â· SY = Second Â· TY = Third Â· LY = Final</p>
            </ChartCard>
          </div>
        </div>
      )}
      {activeTab === 'events' && (
        <div className="space-y-5">
          {!drillEvent ? (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                  <input type="text" placeholder="Search events…" value={search} onChange={e => setSearch(e.target.value)}
                    className="bg-[#1c1c1e] border border-white/[0.06] focus:border-red-600/40 rounded-lg pl-8 pr-3 py-2 text-sm font-fira text-white placeholder-zinc-600 outline-none transition-colors w-56" />
                </div>
                {/* Sort */}
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value as SortOrder)}
                  className="bg-[#1c1c1e] border border-white/[0.06] rounded-lg px-3 py-2 text-sm font-fira text-zinc-300 outline-none cursor-pointer">
                  <option value="participants-desc">Most Participants</option>
                  <option value="participants-asc">Fewest Participants</option>
                  <option value="date-desc">Latest First</option>
                  <option value="date-asc">Earliest First</option>
                </select>
                <span className="text-zinc-600 text-xs font-fira ml-auto">{filteredSortedEvents.length} event{filteredSortedEvents.length !== 1 ? 's' : ''}</span>
              </div>

              {filteredSortedEvents.length === 0 ? (
                <div className="text-center py-16 text-zinc-600 font-fira text-sm">No events match your search.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSortedEvents.map((ev, rank) => (
                    <button key={ev.eventId} type="button" onClick={() => setDrillEvent(ev)}
                      className="bg-[#1c1c1e] border border-white/[0.06] hover:border-red-600/30 rounded-xl p-4 text-left transition-all group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {sortOrder === 'participants-desc' && rank < 3 && (
                            <span className={`shrink-0 text-[10px] font-fira font-bold px-1.5 py-0.5 rounded mt-0.5 ${rank === 0 ? 'bg-red-600/20 text-red-400' : 'bg-zinc-800 text-zinc-500'}`}>
                              #{rank + 1}
                            </span>
                          )}
                          <p className="text-white font-fira font-semibold text-sm group-hover:text-red-400 transition-colors leading-tight">{ev.eventName}</p>
                        </div>
                        <button type="button" onClick={e => { e.stopPropagation(); downloadAttendance(ev.eventId, ev.eventName); }}
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
                          <p className="text-zinc-300 text-sm font-fira font-semibold">{ev.genderStats['MALE'] ?? 0}M / {ev.genderStats['FEMALE'] ?? 0}F</p>
                          <p className="text-zinc-600 text-[11px] font-fira">{Object.keys(ev.branchStats).length} branches</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-0.5 h-1.5 rounded-full overflow-hidden">
                        {Object.entries(ev.branchStats).slice(0, 8).map(([b, c], i) => (
                          <div key={b} style={{ flex: c, background: C.branch[i % C.branch.length] }} title={BRANCH_ABBR[b as BranchKey] || b} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <EventDrillDown event={drillEvent} onBack={() => setDrillEvent(null)} />
          )}
        </div>
      )}

      {/* ─── COMPARISON ────────────────────────────────────────────────────────── */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-zinc-400 text-sm font-fira">
              Select events to compare.{' '}
              {selectedEvents.length > 0 && <span className="text-white font-semibold">{selectedEvents.length} selected</span>}
            </p>
            <div className="flex items-center gap-2">
              {selectedEvents.length > 0 && (
                <>
                  <button type="button" onClick={() => selectedEvents.forEach(e => downloadAttendance(e.eventId, e.eventName))}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1c1e] border border-white/[0.06] hover:border-red-600/30 text-zinc-300 hover:text-white text-xs font-fira rounded-lg transition-all">
                    <DocumentDownload size={13} /> Download All
                  </button>
                  <button type="button" onClick={() => setSelectedEvents([])}
                    className="px-3 py-1.5 text-xs font-fira text-zinc-500 hover:text-white border border-white/[0.06] hover:border-white/15 rounded-lg transition-all">
                    Clear
                  </button>
                </>
              )}
              {selectedEvents.length < statsData.length && (
                <button type="button" onClick={() => setSelectedEvents([...statsData])}
                  className="px-3 py-1.5 text-xs font-fira text-zinc-400 hover:text-white border border-white/[0.06] hover:border-white/15 rounded-lg transition-all">
                  Select All
                </button>
              )}
            </div>
          </div>

          {/* Event picker */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statsData.map(ev => {
              const sel = selectedEvents.includes(ev);
              return (
                <button key={ev.eventId} type="button" onClick={() => setSelectedEvents(prev => sel ? prev.filter(e => e !== ev) : [...prev, ev])}
                  className={`p-3 rounded-xl border text-left transition-all ${sel ? 'border-red-600/40 bg-red-600/10' : 'border-white/[0.06] bg-[#1c1c1e] hover:border-white/15'}`}>
                  <div className={`w-3 h-3 rounded-full border-2 mb-2 transition-all ${sel ? 'bg-red-500 border-red-500' : 'border-zinc-600'}`} />
                  <p className={`text-sm font-fira font-semibold leading-tight ${sel ? 'text-white' : 'text-zinc-400'}`}>{ev.eventName}</p>
                  <p className="text-zinc-600 text-xs font-fira mt-1">{ev.totalParticipants} participants</p>
                </button>
              );
            })}
          </div>

          {selectedEvents.length > 1 && (
            <div className="space-y-5">
              {/* Head-to-head table */}
              <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-white/[0.06]">
                  <h3 className="text-white font-fira font-semibold text-sm">Head-to-Head</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.04]">
                        <th className="text-left px-5 py-2.5 text-zinc-500 text-xs font-fira font-normal">Metric</th>
                        {selectedEvents.map(e => (
                          <th key={e.eventId} className="text-left px-5 py-2.5 text-zinc-300 text-xs font-fira font-semibold whitespace-nowrap">{e.eventName}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          label: 'Participants',
                          fn: (e: StatsData) => e.totalParticipants.toLocaleString(),
                          bestId: selectedEvents.reduce((m, e) => e.totalParticipants > m.totalParticipants ? e : m, selectedEvents[0]).eventId,
                        },
                        {
                          label: 'Male',
                          fn: (e: StatsData) => String(e.genderStats['MALE'] || 0),
                          bestId: null,
                        },
                        {
                          label: 'Female',
                          fn: (e: StatsData) => String(e.genderStats['FEMALE'] || 0),
                          bestId: selectedEvents.reduce((m, e) => (e.genderStats['FEMALE']||0) > (m.genderStats['FEMALE']||0) ? e : m, selectedEvents[0]).eventId,
                        },
                        {
                          label: 'Branches',
                          fn: (e: StatsData) => String(Object.keys(e.branchStats).length),
                          bestId: selectedEvents.reduce((m, e) => Object.keys(e.branchStats).length > Object.keys(m.branchStats).length ? e : m, selectedEvents[0]).eventId,
                        },
                        {
                          label: 'Top Branch',
                          fn: (e: StatsData) => {
                            const t = Object.entries(e.branchStats).sort((a, b) => b[1] - a[1])[0];
                            return t ? `${BRANCH_ABBR[t[0] as BranchKey] || t[0]} (${t[1]})` : '-';
                          },
                          bestId: null,
                        },
                      ].map(row => (
                        <tr key={row.label} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                          <td className="px-5 py-3 text-zinc-500 text-xs font-fira">{row.label}</td>
                          {selectedEvents.map(e => (
                            <td key={e.eventId} className={`px-5 py-3 text-xs font-fira font-semibold whitespace-nowrap ${row.bestId === e.eventId ? 'text-red-400' : 'text-zinc-200'}`}>
                              {row.fn(e)}
                              {row.bestId === e.eventId && <span className="ml-1 text-[9px] opacity-60">▲</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Participant count bars */}
              <ChartCard title="Participant Count Comparison">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={comparisonData} barSize={32}>
                    <XAxis dataKey="metric" tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ fontFamily: 'Fira Sans', fontSize: 12, color: '#a1a1aa' }} />
                    {selectedEvents.map((e, i) => <Bar key={e.eventId} dataKey={e.eventName} fill={C.bars[i % C.bars.length]} radius={[4, 4, 0, 0]} />)}
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Year distribution comparison */}
              <ChartCard title="Academic Year Distribution Comparison">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={compYearData} barSize={18}>
                    <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 12, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ fontFamily: 'Fira Sans', fontSize: 12, color: '#a1a1aa' }} />
                    {selectedEvents.map((e, i) => <Bar key={e.eventId} dataKey={e.eventName} fill={C.bars[i % C.bars.length]} radius={[3, 3, 0, 0]} />)}
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Branch radar */}
              <ChartCard title="Combined Branch Coverage">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={compBranchData}>
                    <PolarGrid stroke="#323235" />
                    <PolarAngleAxis dataKey="branch" tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Fira Sans' }} />
                    <PolarRadiusAxis angle={30} tick={{ fill: '#52525b', fontSize: 10 }} />
                    <Radar name="Students" dataKey="count" stroke={C.red} fill={C.red} fillOpacity={0.2} />
                    <Tooltip content={<DarkTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Gender split */}
              <ChartCard title="Gender Split Comparison">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {selectedEvents.map((e, i) => {
                    const m = e.genderStats['MALE'] || 0;
                    const f = e.genderStats['FEMALE'] || 0;
                    const tot = m + f;
                    const mp = tot > 0 ? (m / tot) * 100 : 50;
                    return (
                      <div key={e.eventId} className="bg-[#1c1c1e] rounded-xl p-3 border border-white/[0.06]">
                        <p className="text-white text-xs font-fira font-semibold leading-tight mb-3 line-clamp-2">{e.eventName}</p>
                        <div className="h-2 rounded-full overflow-hidden flex">
                          <div style={{ width: `${mp}%`, background: C.bars[i % C.bars.length] }} />
                          <div style={{ width: `${100 - mp}%`, background: '#f97316' }} />
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-zinc-400 text-[10px] font-fira">{m}M ({mp.toFixed(0)}%)</span>
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
            <p className="text-center py-12 text-zinc-600 font-fira text-sm">Select at least 2 events to compare</p>
          )}
          {selectedEvents.length === 0 && (
            <p className="text-center py-12 text-zinc-600 font-fira text-sm">Select events above to start comparing</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Per-event drill-down ──────────────────────────────────────────────────────
function EventDrillDown({ event, onBack }: { event: StatsData; onBack: () => void }) {
  const branchData = Object.entries(event.branchStats)
    .map(([b, v]) => ({ name: BRANCH_ABBR[b as BranchKey] || b, value: v }))
    .sort((a, b) => b.value - a.value);

  const genderData = Object.entries(event.genderStats).map(([name, value]) => ({ name, value }));
  const total = event.totalParticipants;
  const m = event.genderStats['MALE'] || 0;
  const f = event.genderStats['FEMALE'] || 0;

  const refYear = new Date(event.dates[0]).getFullYear();
  const yearData = Object.entries(event.yearStats).map(([yr, c]) => {
    const diff = parseInt(yr) - refYear;
    const label = diff === 4 ? 'FY' : diff === 3 ? 'SY' : diff === 2 ? 'TY' : diff === 1 ? 'LY' : 'Other';
    return { year: label, count: c };
  }).filter(d => d.year !== 'Other')
    .sort((a, b) => ['FY','SY','TY','LY'].indexOf(a.year) - ['FY','SY','TY','LY'].indexOf(b.year));

  const totalYr = yearData.reduce((s, d) => s + d.count, 0);
  const femalePct = total > 0 ? ((f / total) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <button type="button" onClick={onBack}
          className="shrink-0 mt-0.5 flex items-center gap-1.5 px-3 py-1.5 text-xs font-fira text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all">
          <ArrowLeft size={13} /> All Events
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-marcellus text-lg leading-tight">{event.eventName}</h2>
          <p className="text-zinc-500 text-xs font-fira mt-0.5">
            {new Date(event.dates[0]).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button type="button" onClick={() => downloadAttendance(event.eventId, event.eventName)}
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#1c1c1e] border border-white/[0.06] hover:border-red-600/30 text-zinc-300 hover:text-white text-sm font-fira rounded-lg transition-all">
          <DocumentDownload size={15} /> Download Attendance
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Participants" value={total} accent />
        <StatCard label="Male" value={m} sub={`${total > 0 ? ((m / total) * 100).toFixed(1) : 0}% of total`} />
        <StatCard label="Female" value={f} sub={`${femalePct}% of total`}
          trend={{ direction: parseFloat(femalePct) >= 30 ? 'up' : 'neutral', text: `${femalePct}%` }} />
        <StatCard label="Branches" value={Object.keys(event.branchStats).length} sub={`top: ${branchData[0]?.name || '-'}`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Branch Breakdown">
          <ResponsiveContainer width="100%" height={220}>
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
          <div className="flex items-center justify-center gap-8 py-2">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={4}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={yearData} barSize={44}>
                <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 13, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Fira Sans' }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Students">
                  {yearData.map((_, i) => <Cell key={i} fill={C.year[i % C.year.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-3 pt-1">
              {yearData.map((d, i) => {
                const pct = totalYr > 0 ? (d.count / totalYr) * 100 : 0;
                return (
                  <div key={d.year} className="flex items-center gap-3">
                    <span className="text-zinc-300 text-sm font-fira font-semibold w-7">{d.year}</span>
                    <div className="flex-1 bg-[#252527] rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: C.year[i] }} />
                    </div>
                    <span className="text-white text-sm font-fira font-bold w-8 text-right">{d.count}</span>
                    <span className="text-zinc-500 text-xs font-fira w-9 text-right">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-zinc-700 text-xs font-fira mt-3">FY = First Year · SY = Second · TY = Third · LY = Final</p>
        </ChartCard>
      </div>
    </div>
  );
}
