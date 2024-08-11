
import { NavLink } from "react-router-dom";
import { Grid3, Gift, Calendar, Chart, Logout, Icon as IconType} from "iconsax-react";
import Eventio from "../assets/Eventio.svg";

const MenuItem = ({ Icon, href, children } :
  { Icon: IconType, href: string, children: string }
) => (
  <NavLink to={href} className="hover:cursor-pointer hover:drop-shadow-xl">
    {({ isActive }) => (
      <div
        className={`font-poppins flex items-center gap-4 whitespace-nowrap ${
          isActive ? "text-[#b61f2d]" : "text-gray-600"
        }`}
      >
        <Icon
          size="26"
          variant={isActive ? "Bold" : "Linear"}
          color={isActive ? "#b61f2d" : "currentColor"}
        />
        <div className="flex-auto">{children}</div>
      </div>
    )}
  </NavLink>
);

export default function Sidebar() {
  const menuItems = [
    {
      icon: Grid3,
      text: "Dashboard",
      href: "/",
    },
    {
      icon: Gift,
      text: "Events",
      href: "/events",
    },
    {
      icon: Calendar,
      text: "Calendar",
      href: "/calendar",
    },
    {
      icon: Chart,
      text: "Statistics",
      href: "/stats",
    },
  ];

  return (
    <div className="fixed top-0 left-0 h-full w-[250px] bg-[#f3f3f3] rounded-3xl px-[35px] py-[55px]">
      <nav className="flex h-full flex-col justify-between">
        <div>
          <header className="flex justify-between gap-3.5 whitespace-nowrap">
            <img
              loading="lazy"
              src={Eventio}
              alt="Eventio logo"
              className="my-auto aspect-[0.93] w-[39px]"
            />
            <div className="grow justify-center">
              <h1 className="text-red font-marcellus text-center text-3xl">
                Eventio
              </h1>
              <h2 className="text-md font-fira italic">By CSI-KJSCE</h2>
            </div>
          </header>
          <div className="my-10 flex flex-col gap-10">
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                Icon={item.icon}
                href={item.href}
              >
                {item.text}
              </MenuItem>
            ))}
          </div>
        </div>
        <footer className="flex items-center gap-4 text-gray-600 pb-[45px]">
          <Logout size="26" variant="Bold" />
          <div className="font-poppins">Logout</div>
        </footer>
      </nav>
    </div>
  );
}
