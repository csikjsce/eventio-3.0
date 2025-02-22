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
    <div className="flex">
      <Sidebar />
      <div className="w-screen pl-[16.66vw]">
        <Outlet />
      </div>
    </div>
  );
}