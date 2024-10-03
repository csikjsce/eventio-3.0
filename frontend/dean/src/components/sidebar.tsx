import React from "react";
import { NavLink, Link } from "react-router-dom";
import { Home, LogoutCurve, Icon } from "iconsax-react";
import Eventio from "../assets/Eventio.svg";

const MenuItem = ({
    Logo,
    href,
    children,
}: {
    Logo: Icon;
    href: string;
    children: React.ReactNode;
}) => (
    <NavLink to={href} className="hover:cursor-pointer hover:drop-shadow-xl">
        {({ isActive }) => (
            <div
                className={`font-poppins flex items-center gap-4 whitespace-nowrap ${
                    isActive ? "text-primary" : "text-gray-600"
                }`}
            >
                <Logo
                    size="26"
                    variant={isActive ? "Bold" : "Linear"}
                    color="currentColor"
                />
                <div className="flex-auto">{children}</div>
            </div>
        )}
    </NavLink>
);

export default function Sidebar() {
    const menuItems = [
        {
            text: "Home",
            href: "/",
            Logo: Home,
        },
        // {
        //     text: "Calendar",
        //     href: "/calendar",
        //     Logo: Calendar,
        // },
    ];

    return (
        <div className="fixed top-1/2 left-0 h-[96%] bg-card ml-4 rounded-2xl px-9 py-14 overflow-y-auto transform -translate-y-1/2">
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
                            <h1 className="text-red font-marcellus text-center text-3xl text-primary">
                                Eventio
                            </h1>
                            <h2 className="text-md text-center font-fira italic text-foreground">
                                By CSI-KJSCE
                            </h2>
                        </div>
                    </header>
                    <div className="my-16 flex flex-col gap-10">
                        {menuItems.map((item, index) => (
                            <MenuItem
                                key={index}
                                href={item.href}
                                Logo={item.Logo}
                            >
                                {item.text}
                            </MenuItem>
                        ))}
                        <div className="font-poppins flex items-center gap-4 whitespace-nowrap text-gray-600">
                            {/* Add your PopoverCustomAnimation component here if needed */}
                        </div>
                    </div>
                </div>
                <footer className="flex gap-4 mt-auto text-foreground">
                    <LogoutCurve
                        size="26"
                        variant="Linear"
                        color="currentColor"
                    />
                    <Link to="logout" className="font-poppins">
                        Logout
                    </Link>
                </footer>
            </nav>
        </div>
    );
}
