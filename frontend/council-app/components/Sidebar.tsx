"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BarChart2, PlusSquare, Users,
  CheckSquare, ClipboardList, Megaphone, Wallet, LogOut,
  Sun, Moon, X, Settings,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const NAV_GROUPS = [
  {
    label: "Main",
    routes: [
      { name: "Home",       href: "/",          Icon: LayoutDashboard, exact: true  },
      { name: "Statistics", href: "/statistics", Icon: BarChart2,       exact: false },
      { name: "New Event",  href: "/new-event",  Icon: PlusSquare,      exact: false },
    ],
  },
  {
    label: "Events",
    routes: [
      { name: "Participants", href: "/participants", Icon: Users,         exact: false },
      { name: "Attendance",   href: "/attendance",   Icon: CheckSquare,   exact: false },
      { name: "Approvals",    href: "/approvals",    Icon: ClipboardList, exact: false },
    ],
  },
  {
    label: "Communication",
    routes: [
      { name: "Announcements", href: "/announcements", Icon: Megaphone, exact: false },
      { name: "Budget",        href: "/budget",         Icon: Wallet,    exact: false },
    ],
  },
  {
    label: "Council",
    routes: [
      { name: "Settings", href: "/settings", Icon: Settings, exact: false },
    ],
  },
];

interface Props { onClose?: () => void }

export default function Sidebar({ onClose }: Props) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full w-64 bg-surface border-r border-border-c overflow-y-auto transition-colors duration-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border-c shrink-0">
        <Image src="/EventioLogo.svg" alt="Eventio" width={32} height={32} />
        <div className="flex-1 min-w-0">
          <p className="text-red-500 text-xl leading-none font-marcellus tracking-wide">Eventio</p>
          <p className="text-subtle-tx text-[10px] font-fira mt-0.5 tracking-widest uppercase">Council Portal</p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="text-muted-tx hover:text-tx transition-colors lg:hidden shrink-0">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-subtle-tx text-[10px] font-fira uppercase tracking-widest px-3 mb-1">{group.label}</p>
            <div className="space-y-0.5">
              {group.routes.map((route) => {
                const active = isActive(route.href, route.exact);
                return (
                  <Link key={route.href} href={route.href} onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-fira font-medium transition-all duration-150 border ${
                      active
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : "text-muted-tx hover:bg-surface2 hover:text-tx border-transparent"
                    }`}>
                    <route.Icon size={17} className={active ? "text-red-500" : "text-current"} />
                    {route.name}
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border-c shrink-0 space-y-0.5">
        <button type="button" onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-fira font-medium text-muted-tx hover:bg-surface2 hover:text-tx transition-all duration-150">
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <button type="button" onClick={() => {
            localStorage.removeItem("council_accessToken");
            localStorage.removeItem("council_refreshToken");
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-fira font-medium text-muted-tx hover:bg-red-500/10 hover:text-red-500 transition-all duration-150">
          <LogOut size={17} /> Logout
        </button>
      </div>
    </div>
  );
}
