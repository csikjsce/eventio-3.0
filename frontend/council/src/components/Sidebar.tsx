import { NavLink, Link } from 'react-router-dom';
import EventioLogo from '../assets/EventioLogo.svg';
import { Home, StatusUp, LogoutCurve, AddSquare } from 'iconsax-react';

const routes = [
  { name: 'Home', to: '/', icon: <Home size="28" /> },
  { name: 'Statistics', to: '/statistics', icon: <StatusUp size="28" /> },
  { name: 'New Event', to: '/new-event', icon: <AddSquare size="28" /> },
];

export default function Sidebar() {
  return (
    <div className="fixed h-screen w-1/6 flex flex-col justify-between p-8 bg-card rounded-r-xl font-fira">
      <div className="flex gap-3 justify-center">
        <img src={EventioLogo} alt="Eventio Logo" className="h-12" />
        <div className="flex flex-col justify-between items-center font-marcellus">
          <p className="text-primary text-2xl">Eventio</p>
          <p className="text-foreground text-xs">By CSI-KJSCE</p>
        </div>
      </div>
      <div className="flex flex-col flex-1 gap-4 py-20">
        {routes.map((route) => (
          <NavLink
            key={route.to}
            to={route.to}
            className="text-foreground text-md"
          >
            {({ isActive }) => (
              <div
                className={`flex items-center gap-2 ${isActive ? 'text-primary' : ''}`}
              >
                {route.icon}
                {route.name}
              </div>
            )}
          </NavLink>
        ))}
      </div>
      <div className="text-foreground flex items-center gap-2">
        <LogoutCurve size="28" />
        <Link to="/logout">Logout</Link>
      </div>
    </div>
  );
}
