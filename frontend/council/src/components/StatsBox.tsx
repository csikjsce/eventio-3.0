import React from 'react';

function StatCard({ number, description }) {
  return (
    <section className="bg-[#f3f3f3] font-fira flex w-1/4 flex-none flex-col justify-center rounded-2xl p-4 xl:flex-row xl:gap-2 2xl:p-3">
      <p className="text-3xl font-semibold xl:my-auto">{number}</p>
      <p className="mt-2.5 text-lg xl:my-auto">{description}</p>
    </section>
  );
}

function DashboardStats() {
  const stats = [
    { number: 33, description: 'Total Councils' },
    { number: 24, description: 'Events Done' },
    { number: 10, description: 'Pending Approvals' },
  ];

  return (
    <main className="mx-auto flex w-full justify-between gap-4 overflow-x-auto py-4 text-black">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          number={stat.number}
          description={stat.description}
        />
      ))}
    </main>
  );
}

export default DashboardStats;
