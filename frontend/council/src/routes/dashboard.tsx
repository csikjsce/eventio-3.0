import React from 'react';
import Namaste from '../components/Namaste.tsx';
import StatsBox from '../components/StatsBox.tsx';
import Sidebar from '../components/Sidebar.tsx';
import Search from '../components/Search.tsx';

export default function Dashboard() {
  return (
    
    <div className="flex-1 flex-row p-8 gap-8  h-screen border-4 border-red-500">
     // FIX: fix the css to take full width  
      <div className="flex flex-row gap-8 w-full">
        <div className="w-full">
          <Namaste />
          <StatsBox />
        </div>

        <div className="flex-none flex flex-col">
          <Search />
        </div>
      </div>
    </div>
  );
}
