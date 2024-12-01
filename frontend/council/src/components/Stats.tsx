import React, { useState, useEffect } from 'react';
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
  YAxis
} from 'recharts';

const Stats = ({ eventId }) => {
  const [data, setData] = useState({
    yearData: [
      { name: 'FY', value: 150 },
      { name: 'SY', value: 120 },
      { name: 'TY', value: 100 },
      { name: 'LY', value: 80 }
    ],
    branchData: [
      { name: 'CSE', value: 200 },
      { name: 'IT', value: 150 },
      { name: 'MECH', value: 120 },
      { name: 'CIVIL', value: 100 }
    ],
    genderData: [
      { name: 'Male', value: 300 },
      { name: 'Female', value: 270 }
    ]
  });

  const COLORS = {
    year: ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d'],
    branch: ['#ff7c43', '#f95d6a', '#d45087', '#a05195'],
    gender: ['#0088FE', '#FF8042']
  };

  const totalRegistrations = data.yearData.reduce((acc, curr) => acc + curr.value, 0);

  useEffect(() => {
  }, [eventId]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-2 rounded-md shadow-md">
          <p className="font-fira text-sm text-foreground">{`${label} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full p-4 bg-background rounded-lg shadow-lg">
      <div className="bg-card rounded-lg shadow-md overflow-hidden">
        <div className="p-4 md:p-6 border-b border-mute/20">
          <h2 className="font-marcellus text-2xl text-foreground">
            Event Statistics
          </h2>
        </div>

        <div className="p-4 md:p-6 space-y-8">
          <div className="text-xl md:text-2xl font-fira font-bold text-center text-foreground">
            Total Registrations: {totalRegistrations}
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            {/* Year-wise Distribution */}
            <div className="min-h-[300px]">
              <p className="font-fira text-lg mb-4 text-foreground">
                Year-wise Distribution
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.yearData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value">
                      {data.yearData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.year[index % COLORS.year.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Branch-wise Distribution */}
            <div className="min-h-[300px]">
              <p className="font-fira text-lg mb-4 text-foreground">
                Branch-wise Distribution
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.branchData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label
                    >
                      {data.branchData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.branch[index % COLORS.branch.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => <span className="font-fira text-sm text-mute">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gender Distribution */}
            <div className="min-h-[300px] md:col-span-2">
              <p className="font-fira text-lg mb-4 text-foreground">
                Gender Distribution
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.genderData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label
                    >
                      {data.genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.gender[index % COLORS.gender.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => <span className="font-fira text-sm text-mute">{value}</span>}
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

