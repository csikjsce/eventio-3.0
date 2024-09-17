import React from "react";
import { NavLink } from "react-router-dom";
// import { Gift, Calendar, Logout, Icon as IconType } from "iconsax-react";
import Eventio from "../assets/Eventio.svg";
// import PopoverCustomAnimation from "../components/popoverbutton";

const MenuItem = ({
    // Icon,
    href,
    children,
}: {
    // Icon: IconType;
    href: string;
    children: React.ReactNode;
}) => (
    <NavLink to={href} className="hover:cursor-pointer hover:drop-shadow-xl">
        {({ isActive }) => (
            <div
                className={`font-poppins flex items-center gap-4 whitespace-nowrap ${
                    isActive ? "text-[#b61f2d]" : "text-gray-600"
                }`}
            >
                {/* <Icon
                    size="26"
                    variant={isActive ? "Bold" : "Linear"}
                    color={isActive ? "#b61f2d" : "currentColor"}
                /> */}
                <div className="flex-auto">{children}</div>
            </div>
        )}
    </NavLink>
);

export default function Sidebar() {
    const menuItems = [
        {
            text: "Events",
            href: "/",
            // Icon: Gift,
        },
        {
            text: "Calendar",
            href: "/calendar",
            // Icon: Calendar,
        },
    ];

    return (
        <div className="fixed top-1/2 left-0 h-[96%] ml-6 w-74 bg-[#f3f3f3] rounded-2xl px-9 py-14 overflow-y-auto transform -translate-y-1/2">
            <nav className="flex flex-col h-full justify-between">
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
                    <div className="my-16 flex flex-col gap-10">
                        {menuItems.map((item, index) => (
                            <MenuItem
                                key={index}
                                href={item.href}
                                // Icon={item.Icon}
                            >
                                {item.text}
                            </MenuItem>
                        ))}
                        <div className="font-poppins flex items-center gap-4 whitespace-nowrap text-gray-600">
                            {/* Add your PopoverCustomAnimation component here if needed */}
                        </div>
                    </div>
                </div>
                <footer className="flex gap-4 text-gray-600 mt-auto pb-12">
                    <div className="font-poppins">Logout</div>
                </footer>
            </nav>
        </div>
    );
}
