import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { Calendar2, Location, User, ArrowDown2 } from 'iconsax-react';

const branchAbbreviations = {
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

const COLORS = {
  primary: '#8884d8',
  mute: '#aaaaaa',
  branch: [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82CA9D',
    '#FFC658',
    '#FF6B6B',
    '#4ECDC4',
    '#556FB5',
    '#9B59B6',
  ],
  gender: ['#0088FE', '#FF8042'],
  year: ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d'],
  barChart: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00c49f'],
};

const ComparisonMetrics = {
  totalParticipants: 'Participants',
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: string }[];
  label?: string;
}) => {
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
  const [councils, setCouncils] = useState([]);
  const [selectedCouncil, setSelectedCouncil] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [statsData, setStatsData] = useState<{} | null>(null);

  useEffect(() => {
    const fetchCouncils = async () => {
      try {
        const response = await axios.request({
          baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
          url: '/api/v1/council/p/get',
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
          },
        });
        if (response && response.data && response.data.councils) {
          setCouncils(response.data.councils);
          if (response.data.councils.length > 0) {
            setSelectedCouncil(response.data.councils[0]);
          }
        } else {
          setCouncils([]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCouncils();
  }, []);


  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedCouncil) return;

      try {
        const response = await axios.request({
          baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
          url: '/api/v1/event/p/stats',
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
          },
        });

        const filteredEvents = response.data.data.filter(
          event => event.organizerId === selectedCouncil.id
        );

        setStatsData({ ...response.data, data: filteredEvents });
        setSelectedEvents([]); // Reset selected events
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [selectedCouncil]);
  ;

  const filteredEvents = useMemo(() => {
    return statsData?.data || [];
  }, [statsData]);

  const comparisonData = useMemo(() => {
    return Object.entries(ComparisonMetrics).map(([key, label]) => ({
      metric: label,
      ...selectedEvents.reduce(
        (acc, event) => ({
          ...acc,
          [event.eventName]:
            event[
            key === 'totalParticipants' ? key : Object.keys(event[key]).length
            ],
        }),
        {},
      ),
    }));
  }, [selectedEvents]);

  const keyInsights = useMemo(() => {
    if (!statsData?.data) return {};

    const events = statsData.data;
    const totalEvents = events.length;
    const totalParticipants = events.reduce(
      (sum, event) => sum + event.totalParticipants,
      0,
    );
    const averageAttendance = totalEvents > 0
      ? Math.round(totalParticipants / totalEvents)
      : 0;
    const mostPopularEvent = events.reduce((max, event) =>
      max.totalParticipants > event.totalParticipants ? max : event,
      { totalParticipants: 0, eventName: 'N/A' }
    );

    const allBranches = events.flatMap((event) =>
      Object.entries(event.branchStats).map(([branch, count]) => ({
        branch,
        count,
      })),
    );

    const branchTotals = allBranches.reduce((acc, { branch, count }) => {
      acc[branch] = (acc[branch] || 0) + count;
      return acc;
    }, {});

    const mostActiveBranch = Object.entries(branchTotals).reduce(
      (max, [branch, count]) => (count > max.count ? { branch, count } : max),
      { branch: 'N/A', count: 0 },
    );

    const totalMale = events.reduce(
      (sum, event) => sum + (event.genderStats['MALE'] || 0),
      0,
    );
    const totalFemale = events.reduce(
      (sum, event) => sum + (event.genderStats['FEMALE'] || 0),
      0,
    );

    const genderRatio = totalMale === 0 && totalFemale === 0
      ? 'NA:NA'
      : `${(totalMale / (totalFemale || 1)).toFixed(2)}:1`;

    return {
      totalEvents,
      mostPopularEvent: mostPopularEvent.eventName,
      mostPopularEventParticipants: mostPopularEvent.totalParticipants,
      averageAttendance,
      mostActiveBranch: mostActiveBranch.branch,
      genderRatio,
    };
  }, [statsData]);

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-fira text-foreground text-3xl font-bold mb-8">
          Council Statistics
        </h1>

        <div className="mb-6 relative">
          <div className="flex items-center space-x-4">
            <label className="text-white font-bold">Select Council:</label>
            <div className="relative">
              <select
                value={selectedCouncil?.id || ''}
                onChange={(e) => {
                  const council = councils.find(
                    c => c.id === parseInt(e.target.value)
                  );
                  setSelectedCouncil(council || null);
                }}
                className="appearance-none w-full bg-card text-white px-4 py-2 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {councils.map((council) => (
                  <option key={council.id} value={council.id}>
                    {council.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              className={`px-6 py-2 rounded-full font-fira text-lg ${activeTab === 'overview'
                ? 'bg-primary text-white'
                : 'bg-background text-foreground'
                }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-6 py-2 rounded-full font-fira text-lg ${activeTab === 'comparison'
                ? 'bg-primary text-white'
                : 'bg-background text-foreground'
                }`}
              onClick={() => setActiveTab('comparison')}
            >
              Event Comparison
            </button>
          </div>
        </div>

        {activeTab === 'overview' && statsData?.data && (
          <>
            {statsData.data.length === 0 ? (
              <div className="text-center text-white text-xl">
                No events found for this council
              </div>
            ) : (
              <>
                <KeyInsights insights={keyInsights} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  <div className="lg:col-span-2">
                    <ParticipationTrendChart data={statsData.data} />
                  </div>

                  <div className="h-[400px]">
                    <EventCountChart
                      data={statsData.data.map((event) => ({
                        name: event.eventName,
                        value: event.totalParticipants,
                      }))}
                    />
                  </div>

                  <div className="h-[400px]">
                    <BranchDistributionChart
                      data={Object.entries(
                        statsData.data.reduce((acc, event) => {
                          Object.entries(event.branchStats).forEach(
                            ([branch, count]) => {
                              acc[branchAbbreviations[branch]] =
                                (acc[branchAbbreviations[branch]] || 0) + count;
                            },
                          );
                          return acc;
                        }, {}),
                      ).map(([name, value]) => ({ name, value }))}
                    />
                  </div>

                  <div className="h-[400px]">
                    <GenderDistributionChart
                      data={Object.entries(
                        statsData.data.reduce((acc, event) => {
                          Object.entries(event.genderStats).forEach(
                            ([gender, count]) => {
                              acc[gender] = (acc[gender] || 0) + count;
                            },
                          );
                          return acc;
                        }, {}),
                      ).map(([name, value]) => ({ name, value }))}
                    />
                  </div>

                  <div className="h-[375px] bg-card p-4 rounded-md shadow-md">
                    <h2 className="font-fira text-foreground text-xl font-bold mb-4">
                      Academic Year Distribution
                    </h2>
                    <YearDistributionChart
                      data={statsData.data.reduce((acc, event) => {
                        Object.entries(event.yearStats).forEach(([year, count]) => {
                          acc[year] = (acc[year] || 0) + count;
                        });
                        return acc;
                      }, {})}
                      eventDate={statsData.data[0]?.dates[0]}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'comparison' && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Event Comparison
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.eventId}
                    className={`bg-card p-4 rounded-md shadow-md cursor-pointer ${selectedEvents.includes(event)
                      ? 'border-2 border-blue-500'
                      : ''
                      }`}
                    onClick={() => {
                      setSelectedEvents((prev) =>
                        prev.includes(event)
                          ? prev.filter((e) => e !== event)
                          : [...prev, event],
                      );
                    }}
                  >
                    <h3 className="font-bold text-white text-lg mb-2">
                      {event.eventName}
                    </h3>
                    <p className="text-white">
                      Participants: {event.totalParticipants}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {selectedEvents.length > 0 && (
              <>
                <ComparisonChart data={comparisonData} events={selectedEvents} />
                {/* <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2"> */}
                <BranchRadarChart events={selectedEvents} />
                {/* <GenderRadarChart events={selectedEvents} /> */}
                {/* </div> */}
              </>
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
      <h2 className="font-fira text-foreground text-2xl font-bold mb-4">
        Key Insights
      </h2>
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
        <h3 className="font-fira text-foreground text-lg font-bold ml-2">
          {title}
        </h3>
      </div>
      <p className="font-fira text-white text-2xl font-bold">{value}</p>
      {subvalue && <p className="font-fira text-white text-sm">{subvalue}</p>}
    </div>
  );
}

function EventCountChart({ data }) {
  return (
    <div className="bg-card p-4 rounded-md shadow-md">
      <h2 className="font-fira text-foreground text-xl font-bold mb-4">
        Event Participation Count
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis tick={{ fill: COLORS.mute }} />
          <YAxis tick={{ fill: COLORS.mute }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS.barChart[index % COLORS.barChart.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BranchDistributionChart({ data }) {
  return (
    <div className="bg-card p-4 rounded-md shadow-md">
      <h2 className="font-fira text-foreground text-xl font-bold mb-4">
        Branch Distribution
      </h2>
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
              <Cell
                key={`cell-${index}`}
                fill={COLORS.branch[index % COLORS.branch.length]}
              />
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
      <h2 className="font-fira text-foreground text-xl font-bold mb-4">
        Gender Distribution
      </h2>
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
              <Cell
                key={`cell-${index}`}
                fill={COLORS.gender[index % COLORS.gender.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ParticipationTrendChart({ data }) {
  const trendData = useMemo(() => {
    return [...data]
      .sort((a, b) => new Date(a.dates[0]) - new Date(b.dates[0]))
      .map((event) => ({
        name: event.eventName,
        participants: event.totalParticipants,
        date: new Date(event.dates[0]).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      }));
  }, [data]);

  const CustomTrendTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 rounded-md shadow-md">
          <p className="font-fira text-foreground text-sm font-medium mb-1">
            {payload[0]?.payload.name}
          </p>
          <p className="font-fira text-foreground text-sm">{`Date: ${label}`}</p>
          <p className="font-fira text-white text-sm">
            {`Participants: ${payload[0]?.value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card p-4 rounded-md shadow-md">
      <h2 className="font-fira text-foreground text-xl font-bold mb-4">
        Participation Trend
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <XAxis
            dataKey="date"
            tick={{ fill: COLORS.mute }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fill: COLORS.mute }} />
          <Tooltip content={<CustomTrendTooltip />} />
          <Line
            type="monotone"
            dataKey="participants"
            stroke={COLORS.primary}
            strokeWidth={2}
            dot={{ fill: COLORS.primary }}
            name="Participants"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function YearDistributionChart({ data, eventDate }) {
  const yearData = useMemo(() => {
    const currentYear = new Date(eventDate).getFullYear();

    const academicYearData = {};
    Object.entries(data).forEach(([gradYear, count]) => {
      const yearsToGrad = parseInt(gradYear) - currentYear;
      let academicYear;

      switch (yearsToGrad) {
        case 4:
          academicYear = 'FY';
          break;
        case 3:
          academicYear = 'SY';
          break;
        case 2:
          academicYear = 'TY';
          break;
        case 1:
          academicYear = 'LY';
          break;
        default:
          academicYear = 'Other';
      }

      academicYearData[academicYear] =
        (academicYearData[academicYear] || 0) + count;
    });

    return Object.entries(academicYearData)
      .filter(([year]) => year !== 'Other')
      .map(([year, count]) => ({
        year,
        count,
      }))
      .sort((a, b) => {
        const order = { FY: 1, SY: 2, TY: 3, LY: 4 };
        return order[a.year] - order[b.year];
      });
  }, [data, eventDate]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={yearData}>
        <XAxis dataKey="year" tick={{ fill: COLORS.mute }} />
        <YAxis tick={{ fill: COLORS.mute }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]}>
          {yearData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS.barChart[index % COLORS.barChart.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
function ComparisonChart({ data, events }) {
  const COLORS_EXTENDED = [
    COLORS.primary,
    '#FF8042',
    '#FFBB28',
    '#00C49F',
    '#0088FE',
    '#FF6B6B',
    '#4CAF50',
    '#9C27B0',
    '#FF9800',
  ];

  return (
    <div className="bg-card p-4 rounded-md shadow-md overflow-x-auto">
      <h2 className="font-fira text-foreground text-xl font-bold mb-4">
        Event Comparison
      </h2>
      <ResponsiveContainer width="100%" height={400 + events.length * 30}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fill: COLORS.mute }} />
          <YAxis
            dataKey="metric"
            type="category"
            width={150}
            tick={{ fill: COLORS.mute }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {events.map((event, index) => (
            <Bar
              key={event.eventId}
              dataKey={event.eventName}
              fill={COLORS_EXTENDED[index % COLORS_EXTENDED.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


function BranchRadarChart({ events }) {
  const radarData = useMemo(() => {
    const branches = Object.keys(branchAbbreviations);
    return branches.map((branch) => {
      const data = { branch: branchAbbreviations[branch] };
      events.forEach((event) => {
        data[event.eventName] = event.branchStats[branch] || 0;
      });
      return data;
    });
  }, [events]);

  return (
    <div className="bg-card p-4 rounded-md shadow-md">
      <h2 className="font-fira text-foreground text-xl font-bold mb-4">
        Branch-wise Distribution
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="branch" tick={{ fill: COLORS.mute }} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: COLORS.mute }} />
          {events.map((event, index) => (
            <Radar
              key={event.eventId}
              name={event.eventName}
              dataKey={event.eventName}
              stroke={COLORS.branch[index % COLORS.branch.length]}
              fill={COLORS.branch[index % COLORS.branch.length]}
              fillOpacity={0.6}
            />
          ))}
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}


// function GenderRadarChart({ events }) {
//   const radarData = useMemo(() => {
//     const genders = ['MALE', 'FEMALE'];
//     return genders.map((gender) => {
//       const data = { gender };
//       events.forEach((event) => {
//         data[event.eventName] = event.genderStats[gender] || 0;
//       });
//       return data;
//     });
//   }, [events]);
//
//   return (
//     <div className="bg-card p-4 rounded-md shadow-md">
//       <h2 className="font-fira text-foreground text-xl font-bold mb-4">
//         Gender-wise Distribution
//       </h2>
//       <ResponsiveContainer width="100%" height={400}>
//         <RadarChart data={radarData}>
//           <PolarGrid />
//           <PolarAngleAxis dataKey="gender" tick={{ fill: COLORS.mute }} />
//           <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: COLORS.mute }} />
//           {events.map((event, index) => (
//             <Radar
//               key={event.eventId}
//               name={event.eventName}
//               dataKey={event.eventName}
//               stroke={COLORS.gender[index % COLORS.gender.length]}
//               fill={COLORS.gender[index % COLORS.gender.length]}
//               fillOpacity={0.6}
//             />
//           ))}
//           <Tooltip content={<CustomTooltip />} />
//           <Legend />
//         </RadarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }
export { Statistics };
export default Statistics;
