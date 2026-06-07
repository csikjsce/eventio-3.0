"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Inbox, CalendarDays, BarChart2,
  List, LogOut, Sun, Moon, X, Settings,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { logout } from "@/lib/api";
import { useData } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";

const NAV = [
  { name: "Dashboard",  href: "/",           Icon: LayoutDashboard, exact: true  },
  { name: "Pending",    href: "/pending",    Icon: Inbox,           exact: false },
  { name: "All Events", href: "/events",     Icon: List,            exact: false },
  { name: "Calendar",   href: "/calendar",   Icon: CalendarDays,    exact: false },
  { name: "Statistics", href: "/statistics", Icon: BarChart2,       exact: false },
  { name: "Settings",   href: "/settings",   Icon: Settings,        exact: false },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { pendingEvents, user } = useData();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="flex flex-col h-full w-64 bg-card border-r border-border">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border shrink-0">
        <Image src="/EventioLogo.svg" alt="Eventio" width={32} height={32} />
        <div className="flex-1 min-w-0">
          <p className="text-red-500 font-marcellus text-xl leading-none tracking-wide">Eventio</p>
          <p className="text-muted-foreground text-[10px] mt-0.5 tracking-widest uppercase">
            {user?.role === "PRINCIPAL" ? "Principal Portal" : "Faculty Portal"}
          </p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ name, href, Icon, exact }) => {
          const active = isActive(href, exact);
          const badge  = name === "Pending" && pendingEvents.length > 0;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border",
                active
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent",
              )}
            >
              <Icon size={17} />
              {name}
              {badge && (
                <span className="ml-auto min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingEvents.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border space-y-0.5 shrink-0">
        <button type="button" onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <button type="button" onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
          <LogOut size={17} /> Logout
        </button>
      </div>
    </aside>
  );
}
