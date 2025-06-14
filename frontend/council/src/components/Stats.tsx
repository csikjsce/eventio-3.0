import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
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
  branchStats: { [key: string]: number };
}

const COLORS = [
  '#ff7c43',
  '#f95d6a',
  '#d45087',
  '#a05195',
  '#0088FE',
  '#FF8042',
  '#00C49F',
  '#FFBB28',
];

const groupBranches = (branchStats: { [key: string]: number }) => {
  const branchGroups = {
    'Computer Science & Related': [
      'Computer_Engineering',
      'Information_Technology',
      'Computer_Science_And_Business_Systems',
      'Computer_And_Communication',
      'CSE(DATA SCIENCE)',
      'CSE - DS',
      'Computer Science Engineering',
      'CSE(IOT & CSBT)',
      'cse-AI',
      'CSE with specialization in IoT, Blockchain Tech and Machine Learning',
    ],
    'Electronics & Computer Engineering': [
      'Electronics_And_Computers',
      'Electronics_And_Telecommunications',
      'Electronics_VLSI',
      'Electronics',
      'electronics and computers',
      'Embedded Electronics And Security System',
      'Power electronic drives',
    ],
    'Artificial Intelligence & Robotics': [
      'Artificial_Intelligence_And_Data_Science',
      'Robotics_And_Artificial_Intelligence',
      'Computer Science and Engineering- Artificial Intelligence',
      'Robotics & Artificial Intelligence (RAI)',
      'Computer Science(Artificial Intelligence)',
    ],
    'Mechanical & Other Engineering': [
      'Mechanical',
      'Engineering Physics',
      'Paramedical Sciences',
    ],
  };

  // Group branches
  const groupedStats: { [key: string]: number } = {};
  let othersTotal = 0;

  Object.entries(branchStats).forEach(([branch, count]) => {
    let grouped = false;

    // Check each group
    for (const [groupName, groupBranches] of Object.entries(branchGroups)) {
      if (groupBranches.includes(branch)) {
        groupedStats[groupName] = (groupedStats[groupName] || 0) + count;
        grouped = true;
        break;
      }
    }

    // If not grouped, add to others
    if (!grouped) {
      othersTotal += count;
    }
  });

  // Add Others if there are any
  if (othersTotal > 0) {
    groupedStats['Others'] = othersTotal;
  }

  return Object.entries(groupedStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

const GroupedBranchStats: React.FC<StatsProps> = ({ eventId }) => {
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

  const branchData = groupBranches(statsData.branchStats);

  return (
    <div className="w-full bg-background rounded-lg shadow-lg">
      <div className="bg-card rounded-lg shadow-md overflow-hidden">
        <div className="p-4 md:p-6 border-b border-mute/20">
          <h2 className="font-marcellus text-2xl text-foreground">
            {statsData.eventName} - Grouped Branch Distribution
          </h2>
        </div>

        <div className="p-4 md:p-6 space-y-8">
          <div className="text-xl md:text-2xl font-fira font-bold text-center text-foreground">
            Total Registrations: {statsData.totalParticipants}
          </div>

          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={branchData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(1)}%)`
                  }
                >
                  {branchData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value) => (
                    <span className="font-fira text-sm text-mute">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupedBranchStats;
