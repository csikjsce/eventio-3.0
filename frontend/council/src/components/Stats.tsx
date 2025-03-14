import React, { useState, useEffect } from 'react';
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
} from 'recharts';
import { TooltipProps } from 'recharts';
import {
  ValueType,
  NameType,
} from 'recharts/types/component/DefaultTooltipContent';

interface StatsProps {
  eventId: string;
}

interface EventStats {
  eventId: string;
  eventName: string;
  totalParticipants: number;
  yearStats: { [key: string]: number };
  branchStats: { [key: string]: number };
  genderStats: { [key: string]: number };
}

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

const Stats: React.FC<StatsProps> = ({ eventId }) => {
  const [statsData, setStatsData] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.request({
          baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
          url: '/api/v1/event/p/stats',
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
          },
        });

        const eventStats = response.data.data.find(
          (event: EventStats) => event.eventId == eventId,
        );

        if (!eventStats) {
          setError('Event not found');
          return;
        }

        setStatsData(eventStats);
        setError(null);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to fetch event statistics');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchStats();
    }
  }, [eventId]);

  const COLORS = {
    year: ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d'],
    branch: ['#ff7c43', '#f95d6a', '#d45087', '#a05195'],
    gender: ['#0088FE', '#FF8042'],
  };

  const formatDataForCharts = (stats: { [key: string]: number }) => {
    return Object.entries(stats).map(([name, value]) => {
      // Type assertion to narrow `name` to keys of branchAbbreviations
      const key = name as keyof typeof branchAbbreviations;
      return {
        name: branchAbbreviations[key] || name,
        value,
      };
    });
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-2 rounded-md shadow-md">
          <p className="font-fira text-sm text-foreground">{`${label} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-foreground">Loading statistics...</p>
      </div>
    );
  }

  if (error || !statsData) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-red-500">{error || 'No data available'}</p>
      </div>
    );
  }

  if (statsData.totalParticipants <= 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-foreground">
          No participants registered for this event.
        </p>
      </div>
    );
  }

  const yearData = formatDataForCharts(statsData.yearStats);
  const branchData = formatDataForCharts(statsData.branchStats);
  const genderData = formatDataForCharts(statsData.genderStats);

  return (
    <div className="w-full bg-background rounded-lg shadow-lg">
      <div className="bg-card rounded-lg shadow-md overflow-hidden">
        <div className="p-4 md:p-6 border-b border-mute/20">
          <h2 className="font-marcellus text-2xl text-foreground">
            {statsData.eventName} Statistics
          </h2>
        </div>

        <div className="p-4 md:p-6 space-y-8">
          <div className="text-xl md:text-2xl font-fira font-bold text-center text-foreground">
            Total Registrations: {statsData.totalParticipants}
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            <div className="min-h-[300px]">
              <p className="font-fira text-lg mb-4 text-foreground">
                Year-wise Distribution
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value">
                      {yearData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS.year[index % COLORS.year.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="min-h-[300px]">
              <p className="font-fira text-lg mb-4 text-foreground">
                Branch-wise Distribution
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={branchData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label
                    >
                      {branchData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS.branch[index % COLORS.branch.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span className="font-fira text-sm text-mute">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="min-h-[300px] md:col-span-2">
              <p className="font-fira text-lg mb-4 text-foreground">
                Gender Distribution
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label
                    >
                      {genderData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS.gender[index % COLORS.gender.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span className="font-fira text-sm text-mute">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
