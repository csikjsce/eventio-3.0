import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Grid3, Gift, Calendar, Logout, Icon as IconType } from "iconsax-react";
import Eventio from "../assets/Eventio.svg";
import PopoverCustomAnimation from "../components/popoverbutton";

const MenuItem = ({
    Icon,
    href,
    children,
}: {
    Icon: IconType;
    href: string;
    children: string;
}) => (
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const menuItems = [
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
    ];

    return (
        <>
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#b61f2d] text-black rounded-full focus:outline-none"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <Grid3 size="24" />
            </button>
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-[#f3f3f3] rounded-2xl px-9 py-14 transform transition-transform duration-300 ease-in-out z-40 ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } md:translate-x-0 md:static md:h-[96vh]`}
            >
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
                                <h2 className="text-md text-center font-fira italic">
                                    By CSI-KJSCE
                                </h2>
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
                            <div className="font-poppins flex items-center gap-4 whitespace-nowrap text-gray-600">
                                <PopoverCustomAnimation />
                            </div>
                        </div>
                    </div>
                    <footer className="flex items-center gap-4 text-gray-600 pb-12">
                        <Logout size="26" variant="Bold" />
                        <div className="font-poppins">Logout</div>
                    </footer>
                </nav>
            </div>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </>
    );
}
