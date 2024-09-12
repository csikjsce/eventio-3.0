import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function SIdebarLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-screen pl-[16.66vw]">
        <Outlet />
      </div>
    </div>
  );
}
