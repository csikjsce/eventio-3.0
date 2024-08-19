import {
  Calendar,
  Home,
  Icon as IconType,
  People,
  ProfileCircle,
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
            color={isActive ? '#B61F2D' : '#57585A'} // TODO: Pass from tailwind theme
          />
          <span
            className={`text-xs font-marcellus ${isActive ? 'text-primary' : 'text-mute-text-light dark:text-mute-text-dark'}`}
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
    <div className="h-14 fixed bottom-0 left-0 w-full flex flex-row justify-around pt-3 z-10 bg-background-light dark:bg-background-dark shadow-2xl">
      <NavbarItem Icon={Home} text="Home" to="/" />
      <NavbarItem Icon={Calendar} text="Calendar" to="/calendar" />
      <NavbarItem Icon={People} text="Councils" to="/councils" />
      <NavbarItem Icon={ProfileCircle} text="Profile" to="/profile" />
    </div>
  );
}
