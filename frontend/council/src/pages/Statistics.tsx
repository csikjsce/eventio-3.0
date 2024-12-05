import React, { useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, LineChart, Line } from 'recharts';
import { FilterSquare, Calendar2, Location, User } from 'iconsax-react';

const COLORS = {
  primary: '#8884d8',
  mute: '#aaaaaa',
  branch: ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#FF6B6B'],
  gender: ['#0088FE', '#FF8042'],
  year: ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d'],
  barChart: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00c49f']
};

const ComparisonMetrics = {
  participants: "Participants",
  duration: "Duration (hours)",
  rating: "Rating"
};

const dummyData = {
  events: [
    {
      id: 1,
      name: "Coffee with CodeCell",
      category: "Technical",
      date: "2023-01-15",
      participants: 150,
      branch: "CSE",
      duration: 4,
      rating: 4.5
    },
    {
      id: 2,
      name: "RTP",
      category: "Cultural",
      date: "2023-02-20",
      participants: 200,
      branch: "All",
      duration: 6,
      rating: 4.8
    },
    {
      id: 3,
      name: "Bit By Bid",
      category: "Sports",
      date: "2023-03-10",
      participants: 180,
      branch: "All",
      duration: 8,
      rating: 4.2
    },
    {
      id: 4,
      name: "Linux Workshop",
      category: "Technical",
      date: "2023-04-05",
      participants: 120,
      branch: "IT",
      duration: 5,
      rating: 4.6
    },
    {
      id: 5,
      name: "Crackathon",
      category: "Technical",
      date: "2023-05-12",
      participants: 250,
      branch: "All",
      duration: 48,
      rating: 4.9
    },
    {
      id: 6,
      name: "Devopia",
      category: "Technical",
      date: "2023-06-18",
      participants: 300,
      branch: "CSE",
      duration: 12,
      rating: 4.7
    },
    {
      id: 7,
      name: "UI & UX Workshop",
      category: "Technical",
      date: "2023-07-22",
      participants: 100,
      branch: "IT",
      duration: 6,
      rating: 4.4
    },
    {
      id: 8,
      name: "Technovate",
      category: "Technical",
      date: "2023-08-30",
      participants: 400,
      branch: "All",
      duration: 72,
      rating: 4.8
    },
    {
      id: 9,
      name: "ETH India",
      category: "Technical",
      date: "2023-09-15",
      participants: 500,
      branch: "All",
      duration: 36,
      rating: 4.9
    }
  ],
  eventCounts: [
    { name: 'Technical', value: 25 },
    { name: 'Cultural', value: 15 },
    { name: 'Sports', value: 10 },
    { name: 'Academic', value: 20 },
  ],
  participationTrend: [
    { date: '2023-01', participants: 200 },
    { date: '2023-02', participants: 250 },
    { date: '2023-03', participants: 300 },
    { date: '2023-04', participants: 280 },
    { date: '2023-05', participants: 350 },
    { date: '2023-06', participants: 400 },
    { date: '2023-07', participants: 380 },
    { date: '2023-08', participants: 450 },
    { date: '2023-09', participants: 500 },
  ],
  branchDistribution: [
    { name: 'CSE', value: 35 },
    { name: 'IT', value: 30 },
    { name: 'ECE', value: 20 },
    { name: 'Mechanical', value: 10 },
    { name: 'Civil', value: 5 },
  ],
  genderDistribution: [
    { name: 'Male', value: 55 },
    { name: 'Female', value: 45 },
  ],
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 rounded-md shadow-md">
        <p className="font-fira text-foreground text-sm font-medium">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="font-fira text-white text-sm">
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function Statistics() {
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [filters, setFilters] = useState({
    category: "All"
  });
  const [activeTab, setActiveTab] = useState("overview");

  const filteredEvents = useMemo(() => {
    return dummyData.events.filter(event => {
      const matchesCategory = filters.category === "All" || event.category === filters.category;
      return matchesCategory;
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
    const totalEvents = dummyData.events.length;
    const totalParticipants = dummyData.events.reduce((sum, event) => sum + event.participants, 0);
    const averageAttendance = Math.round(totalParticipants / totalEvents);
    const mostPopularEvent = dummyData.events.reduce((max, event) => max.participants > event.participants ? max : event);
    const mostActiveBranch = dummyData.branchDistribution.reduce((max, branch) => max.value > branch.value ? max : branch);
    const maleCount = dummyData.genderDistribution.find(g => g.name === 'Male')?.value || 0;
    const femaleCount = dummyData.genderDistribution.find(g => g.name === 'Female')?.value || 0;
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const gcdValue = gcd(maleCount, femaleCount);
    const genderRatio = `${maleCount / gcdValue}:${femaleCount / gcdValue}`;

    return {
      totalEvents,
      mostPopularEvent: mostPopularEvent.name,
      mostPopularEventParticipants: mostPopularEvent.participants,
      averageAttendance,
      mostActiveBranch: mostActiveBranch.name,
      genderRatio,
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-fira text-foreground text-3xl font-bold mb-8">Council Statistics</h1>

        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              className={`px-6 py-2 rounded-full font-fira text-lg ${activeTab === 'overview' ? 'bg-primary text-white' : 'bg-background text-foreground'
                }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-6 py-2 rounded-full font-fira text-lg ${activeTab === 'comparison' ? 'bg-primary text-white' : 'bg-background text-foreground'
                }`}
              onClick={() => setActiveTab('comparison')}
            >
              Event Comparison
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            <KeyInsights insights={keyInsights} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <EventCountChart data={dummyData.eventCounts} />
              <ParticipationTrendChart data={dummyData.participationTrend} />
              <BranchDistributionChart data={dummyData.branchDistribution} />
              <GenderDistributionChart data={dummyData.genderDistribution} />
            </div>
          </>
        )}

        {activeTab === 'comparison' && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Event Comparison</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredEvents.map(event => (
                  <div
                    key={event.id}
                    className={`bg-card p-4 rounded-md shadow-md cursor-pointer ${selectedEvents.includes(event) ? 'border-2 border-blue-500' : ''}`}
                    onClick={() => {
                      setSelectedEvents(prev =>
                        prev.includes(event)
                          ? prev.filter(e => e !== event)
                          : [...prev, event]
                      );
                    }}
                  >
                    <h3 className="font-bold text-white text-lg mb-2">{event.name}</h3>
                    <p className="text-white">Category: {event.category}</p>
                    <p className="text-white">Date: {event.date}</p>
                    <p className="text-white">Participants: {event.participants}</p>
                  </div>
                ))}
              </div>
            </div>
            {selectedEvents.length > 0 && (
              <ComparisonChart data={comparisonData} events={selectedEvents} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function KeyInsights({ insights }) {
  return (
    <div className="mb-8">
      <h2 className="font-fira text-foreground text-2xl font-bold mb-4">Key Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InsightCard
          icon={Calendar2}
          title="Total events organized"
          value={insights.totalEvents}
        />
        <InsightCard
          icon={User}
          title="Most popular event"
          value={insights.mostPopularEvent}
          subvalue={`${insights.mostPopularEventParticipants} participants`}
        />
        <InsightCard
          icon={User}
          title="Average attendance per event"
          value={insights.averageAttendance}
        />
        <InsightCard
          icon={Location}
          title="Most active branch"
          value={insights.mostActiveBranch}
        />
        <InsightCard
          icon={User}
          title="Gender ratio (Male:Female)"
          value={insights.genderRatio}
        />
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, title, value, subvalue }) {
  return (
    <div className="bg-card p-4 rounded-md shadow-md">
      <div className="flex items-center mb-2">
        <Icon size={24} color={COLORS.primary} variant="Bold" />
        <h3 className="font-fira text-foreground text-lg font-bold ml-2">{title}</h3>
      </div>
      <p className="font-fira text-white text-2xl font-bold">{value}</p>
      {subvalue && <p className="font-fira text-white text-sm">{subvalue}</p>}
    </div>
  );
}

function EventCountChart({ data }) {
  return (
    <div className="bg-card p-4 rounded-md shadow-md">
      <h2 className="font-fira text-foreground text-xl font-bold mb-4">Event Count by Category</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fill: COLORS.mute }} />
          <YAxis tick={{ fill: COLORS.mute }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.barChart[index % COLORS.barChart.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ParticipationTrendChart({ data }) {
  return (
    <div className="bg-card p-4 rounded-md shadow-md">
      <h2 className="font-fira text-foreground text-xl font-bold mb-4">Participation Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fill: COLORS.mute }} />
          <YAxis tick={{ fill: COLORS.mute }} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="participants" stroke={COLORS.primary} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function BranchDistributionChart({ data }) {
  return (
    <div className="bg-card p-4 rounded-md shadow-md">
      <h2 className="font-fira text-foreground text-xl font-bold mb-4">Branch Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill={COLORS.primary}
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
    <div className="bg-card p-4 rounded-md shadow-md">
      <h2 className="font-fira text-foreground text-xl font-bold mb-4">Gender Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill={COLORS.primary}
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

function ComparisonChart({ data, events }) {
  const COLORS_EXTENDED = [
    COLORS.primary,
    '#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#FF6B6B', '#4CAF50', '#9C27B0', '#FF9800'
  ];

  return (
    <div className="bg-card p-4 rounded-md shadow-md overflow-x-auto">
      <h2 className="font-fira text-foreground text-xl font-bold mb-4">Event Comparison</h2>
      <ResponsiveContainer width="100%" height={400 + events.length * 30}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fill: COLORS.mute }} />
          <YAxis dataKey="metric" type="category" width={150} tick={{ fill: COLORS.mute }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {events.map((event, index) => (
            <Bar key={event.id} dataKey={event.name} fill={COLORS_EXTENDED[index % COLORS_EXTENDED.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export { Statistics };
export default Statistics;
