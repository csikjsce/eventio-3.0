import React, { useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, LineChart, Line } from 'recharts';
import { SearchNormal1, FilterSquare } from 'iconsax-react';

const COLORS = {
  year: ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d'],
  branch: ['#ff7c43', '#f95d6a', '#d45087', '#a05195'],
  gender: ['#0088FE', '#FF8042']
};

const dummyData = {
  events: [
    {
      id: 1,
      name: "Tech Workshop 2023",
      category: "Technical",
      date: "2023-01-15",
      participants: 150,
      branch: "CSE",
      duration: 4,
      rating: 4.5
    },
    {
      id: 2,
      name: "Cultural",
      category: "Cultural",
      date: "2023-02-20",
      participants: 200,
      branch: "All",
      duration: 6,
      rating: 4.8
    },
    {
      id: 3,
      name: "Sports Meet",
      category: "Sports",
      date: "2023-03-10",
      participants: 180,
      branch: "All",
      duration: 8,
      rating: 4.2
    }
  ],
  eventCounts: [
    { name: 'Technical', value: 15 },
    { name: 'Cultural', value: 10 },
    { name: 'Sports', value: 8 },
    { name: 'Academic', value: 12 },
  ],
  participationTrend: [
    { date: '2023-01', participants: 200 },
    { date: '2023-02', participants: 250 },
    { date: '2023-03', participants: 300 },
    { date: '2023-04', participants: 280 },
    { date: '2023-05', participants: 350 },
  ],
  branchDistribution: [
    { name: 'CSE', value: 30 },
    { name: 'IT', value: 25 },
    { name: 'ECE', value: 20 },
    { name: 'Mechanical', value: 15 },
    { name: 'Civil', value: 10 },
  ],
  genderDistribution: [
    { name: 'Male', value: 60 },
    { name: 'Female', value: 40 },
  ],
};

const ComparisonMetrics = {
  participants: "Participants",
  duration: "Duration (hours)",
  rating: "Rating"
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-2 rounded-md shadow-md">
        <p className="font-fira text-sm text-white">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function Statistics() {
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [filters, setFilters] = useState({
    category: "All",
    search: ""
  });

  const filteredEvents = useMemo(() => {
    return dummyData.events.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = filters.category === "All" || event.category === filters.category;
      return matchesSearch && matchesCategory;
    });
  }, [filters]);

  const comparisonData = useMemo(() => {
    return Object.entries(ComparisonMetrics).map(([key, label]) => ({
      metric: label,
      ...selectedEvents.reduce((acc, event) => ({
        ...acc,
        [event.name]: event[key]
      }), {})
    }));
  }, [selectedEvents]);

  const keyInsights = useMemo(() => {
    const totalEvents = dummyData.eventCounts.reduce((sum, event) => sum + event.value, 0);
    const totalParticipants = dummyData.participationTrend.reduce((sum, trend) => sum + trend.participants, 0);
    const averageAttendance = Math.round(totalParticipants / dummyData.participationTrend.length);
    const mostPopularEvent = dummyData.eventCounts.reduce((max, event) => max.value > event.value ? max : event);
    const mostActiveBranch = dummyData.branchDistribution.reduce((max, branch) => max.value > branch.value ? max : branch);
    const maleCount = dummyData.genderDistribution.find(g => g.name === 'Male')?.value || 0;
    const femaleCount = dummyData.genderDistribution.find(g => g.name === 'Female')?.value || 0;
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const gcdValue = gcd(maleCount, femaleCount);
    const genderRatio = `${maleCount / gcdValue}:${femaleCount / gcdValue}`;

    return {
      totalEvents,
      mostPopularEvent: mostPopularEvent.name,
      mostPopularEventAttendees: mostPopularEvent.value,
      averageAttendance,
      mostActiveBranch: mostActiveBranch.name,
      genderRatio,
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Council Statistics</h1>

      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2 bg-card rounded-lg px-4 py-2">
            <SearchNormal1 size={20} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              className="bg-transparent border-none focus:outline-none text-white"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          
          <select
            className="bg-card rounded-lg px-4 py-2 border-none text-white"
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="All">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
          </select>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-white">Select Events to Compare</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedEvents.includes(event)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-primary/10'
              }`}
              onClick={() => {
                setSelectedEvents(prev =>
                  prev.includes(event)
                    ? prev.filter(e => e !== event)
                    : [...prev, event]
                );
              }}
            >
              <h3 className="font-bold text-white">{event.name}</h3>
              <p className="text-sm opacity-80 text-white">{event.category} • {event.date}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedEvents.length > 0 && (
        <div className="bg-card p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-white">Event Comparison</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonData}>
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedEvents.map((event, index) => (
                <Bar
                  key={event.id}
                  dataKey={event.name}
                  fill={COLORS.year[index % COLORS.year.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <EventCountChart data={dummyData.eventCounts} />
        <ParticipationTrendChart data={dummyData.participationTrend} />
        <BranchDistributionChart data={dummyData.branchDistribution} />
        <GenderDistributionChart data={dummyData.genderDistribution} />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Key Insights</h2>
        <ul className="list-disc list-inside space-y-2 text-white">
          <li>Total events organized: {keyInsights.totalEvents}</li>
          <li>Most popular event category: {keyInsights.mostPopularEvent} with {keyInsights.mostPopularEventAttendees} events</li>
          <li>Average attendance per month: {keyInsights.averageAttendance}</li>
          <li>Most active branch: {keyInsights.mostActiveBranch}</li>
          <li>Gender ratio (Male:Female): {keyInsights.genderRatio}</li>
        </ul>
      </div>
    </div>
  );
}

function EventCountChart({ data }) {
  return (
    <div className="bg-card p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-white mb-4">Event Count by Category</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ParticipationTrendChart({ data }) {
  return (
    <div className="bg-card p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-white mb-4">Participation Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="participants" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function BranchDistributionChart({ data }) {
  return (
    <div className="bg-card p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-white mb-4">Branch Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.branch[index % COLORS.branch.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function GenderDistributionChart({ data }) {
  return (
    <div className="bg-card p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-white mb-4">Gender Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.gender[index % COLORS.gender.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
