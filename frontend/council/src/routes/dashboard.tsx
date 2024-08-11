import React from 'react';
import Namaste from '../components/Namaste.tsx'
import StatsBox from "../components/StatsBox.tsx"
import Sidebar from "../components/Sidebar.tsx"
import Search from "../components/Search.tsx"

export default function Dashboard() {

  return (
      <div className="flex flex-fow p-8 gap-8 w-full h-screen">
        <div className="w-full">
          <Namaste />
          <StatsBox />
        </div>

        <div className="flex-none flex flex-col ">
          <Search />
        </div>
      </div>

  );
}
