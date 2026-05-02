import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useEffect, useState } from 'react';

export default function SidebarLayout() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (isMobile) {
    return (
      <div className="p-4">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#080808]">
      <Sidebar />
      <div className="flex-1 pl-64 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}