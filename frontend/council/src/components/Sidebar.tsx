import { NavLink, Link } from 'react-router-dom';
import EventioLogo from '../assets/EventioLogo.svg';
import { Home, StatusUp, LogoutCurve, AddSquare } from 'iconsax-react';

const routes = [
  { name: 'Home', to: '/', icon: Home },
  { name: 'Statistics', to: '/statistics', icon: StatusUp },
  { name: 'New Event', to: '/new-event', icon: AddSquare },
];

export default function Sidebar() {
  return (
    <div className="fixed h-screen w-64 flex flex-col bg-[#181818] border-r border-white/[0.07]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <img src={EventioLogo} alt="Eventio Logo" className="h-8 w-8" />
        <div>
          <p className="text-red-500 text-xl leading-none font-marcellus tracking-wide">Eventio</p>
          <p className="text-zinc-500 text-[10px] font-fira mt-0.5 tracking-widest uppercase">Council Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {routes.map((route) => (
          <NavLink
            key={route.to}
            to={route.to}
            end={route.to === '/'}
          >
            {({ isActive }) => (
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-fira font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-red-600/15 text-red-500 border border-red-600/20'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100 border border-transparent'
                }`}
              >
                <route.icon
                  size="18"
                  color={isActive ? '#ef4444' : 'currentColor'}
                  variant={isActive ? 'Bold' : 'Linear'}
                />
                {route.name}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5">
        <Link
          to="/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-fira font-medium text-zinc-500 hover:bg-red-600/10 hover:text-red-400 transition-all duration-150"
        >
          <LogoutCurve size="18" color="currentColor" />
          Logout
        </Link>
      </div>
    </div>
  );
}
