import {
  Calendar,
  Home,
  People,
  ProfileCircle,
  Icon as IconType,
} from 'iconsax-react';

import { NavLink } from 'react-router-dom';

function NavbarItem({
  Icon,
  text,
  to,
}: {
  Icon: IconType;
  text: string;
  to: string;
}) {
  return (
    <NavLink to={to} className="flex flex-col items-center">
      {({ isActive }) => (
        <>
          <Icon
            variant={isActive ? 'Bold' : 'Linear'}
            color={isActive ? '#B61F2D' : undefined}
          />
          <span
            className={`text-xs font-marcellus ${isActive ? 'text-red-500' : ''}`}
          >
            {text}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function FooterNav() {
  return (
    <div className="h-20 fixed bottom-0 left-0 w-full flex flex-row justify-between px-6 pt-3 z-10 bg-white">
      <NavbarItem Icon={Home} text="Home" to="/" />
      <NavbarItem Icon={Calendar} text="Calendar" to="/calendar" />
      <NavbarItem Icon={People} text="Councils" to="/councils" />
      <NavbarItem Icon={ProfileCircle} text="Profile" to="/profile" />
    </div>
  );
}
