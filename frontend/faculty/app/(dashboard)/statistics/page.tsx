"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { fetchStats } from "@/lib/api";
import type { StatsItem } from "@/lib/types";
import { BarChart2, Users, Download } from "lucide-react";
import { attendanceReportUrl } from "@/lib/api";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const BRANCH_SHORT: Record<string, string> = {
  Computer_Engineering: "COMP",
  Information_Technology: "IT",
  Mechanical: "Mech",
  Artificial_Intelligence_And_Data_Science: "AIDS",
  Electronics_And_Telecommunications: "EXTC",
};

export default function StatisticsPage() {
  const [stats, setStats]     = useState<StatsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    fetchStats()
      .then((data) => {
        setStats(data);
        if (data.length > 0) setSelected(data[0].eventId);
      })
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => ({
    events:       stats.length,
    participants: stats.reduce((s, e) => s + e.totalParticipants, 0),
  }), [stats]);

  const topEvents = useMemo(() =>
    [...stats]
      .sort((a, b) => b.totalParticipants - a.totalParticipants)
      .slice(0, 8)
      .map((e) => ({ name: e.eventName.slice(0, 20), count: e.totalParticipants })),
    [stats],
  );

  const selectedEvent = stats.find((e) => e.eventId === selected);

  const branchData = useMemo(() => {
    if (!selectedEvent) return [];
    return Object.entries(selectedEvent.branchStats)
      .map(([branch, count]) => ({
        name: BRANCH_SHORT[branch] ?? branch.slice(0, 6),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [selectedEvent]);

  const genderData = useMemo(() => {
    if (!selectedEvent) return [];
    return Object.entries(selectedEvent.genderStats).map(([g, count]) => ({
      name: g, value: count,
    }));
  }, [selectedEvent]);

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
        </div>
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Statistics</h1>
        <p className="text-muted-foreground text-sm">Participation data across all campus events.</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Events",       value: totals.events,       icon: <BarChart2 size={15} /> },
          { label: "Total Participants", value: totals.participants, icon: <Users size={15} />     },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">{s.icon}
              <span className="text-[10px] uppercase tracking-widest">{s.label}</span>
            </div>
            <p className="text-3xl font-bold">{s.value.toLocaleString("en-IN")}</p>
          </div>
        ))}
      </div>

      {/* Top events bar chart */}
      {topEvents.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold mb-4">Top Events by Registration</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topEvents} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-event breakdown */}
      {stats.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold">Event Breakdown</h2>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-sky-500/50"
            >
              {stats.map((e) => (
                <option key={e.eventId} value={e.eventId}>{e.eventName}</option>
              ))}
            </select>
          </div>

          {selectedEvent && (
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">By Branch</p>
                {branchData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={branchData} layout="vertical" margin={{ left: 0 }}>
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={40} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-sm">No branch data.</p>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">By Gender</p>
                {genderData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                        {genderData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-sm">No gender data.</p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Total: </span>
                    <span className="font-semibold">{selectedEvent.totalParticipants}</span>
                  </p>
                  <a
                    href={attendanceReportUrl(selectedEvent.eventId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    <Download size={12} /> Attendance PDF
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {stats.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <p className="text-muted-foreground text-sm">No statistics available yet.</p>
        </div>
      )}
    </div>
  );
}
