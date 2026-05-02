import { NavLink, Link } from 'react-router-dom';
import EventioLogo from '../assets/EventioLogo.svg';
import { Home, StatusUp, LogoutCurve, AddSquare } from 'iconsax-react';
import { Users, ClipboardCheck, CheckSquare, Megaphone, Wallet } from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Main',
    routes: [
      { name: 'Home',       to: '/',          IcxIcon: Home,    end: true },
      { name: 'Statistics', to: '/statistics', IcxIcon: StatusUp, end: false },
      { name: 'New Event',  to: '/new-event',  IcxIcon: AddSquare, end: false },
    ],
  },
  {
    label: 'Events',
    routes: [
      { name: 'Participants', to: '/participants', LcIcon: Users,         end: false },
      { name: 'Attendance',   to: '/attendance',   LcIcon: CheckSquare,   end: false },
      { name: 'Approvals',    to: '/approvals',    LcIcon: ClipboardCheck, end: false },
    ],
  },
  {
    label: 'Communication',
    routes: [
      { name: 'Announcements', to: '/announcements', LcIcon: Megaphone, end: false },
      { name: 'Budget',        to: '/budget',         LcIcon: Wallet,   end: false },
    ],
  },
];

export default function Sidebar() {
  return (
    <div className="fixed h-screen w-64 flex flex-col bg-[#181818] border-r border-white/[0.07] overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5 shrink-0">
        <img src={EventioLogo} alt="Eventio Logo" className="h-8 w-8" />
        <div>
          <p className="text-red-500 text-xl leading-none font-marcellus tracking-wide">Eventio</p>
          <p className="text-zinc-500 text-[10px] font-fira mt-0.5 tracking-widest uppercase">Council Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-zinc-600 text-[10px] font-fira uppercase tracking-widest px-3 mb-1">{group.label}</p>
            <div className="space-y-0.5">
              {group.routes.map(route => (
                <NavLink key={route.to} to={route.to} end={'end' in route ? route.end : false}>
                  {({ isActive }) => (
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-fira font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-red-600/15 text-red-500 border border-red-600/20'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100 border border-transparent'
                    }`}>
                      {'IcxIcon' in route && route.IcxIcon ? (
                        <route.IcxIcon size="18" color={isActive ? '#ef4444' : 'currentColor'} variant={isActive ? 'Bold' : 'Linear'} />
                      ) : (
                        'LcIcon' in route && route.LcIcon
                          ? <route.LcIcon size={17} className={isActive ? 'text-red-500' : 'text-current'} />
                          : null
                      )}
                      {route.name}
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5 shrink-0">
        <Link to="/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-fira font-medium text-zinc-500 hover:bg-red-600/10 hover:text-red-400 transition-all duration-150">
          <LogoutCurve size="18" color="currentColor" />
          Logout
        </Link>
      </div>
    </div>
  );
}
