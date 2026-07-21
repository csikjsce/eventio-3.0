"use client";

import { Calendar, Home, Icon as IconType, People, ProfileCircle } from "iconsax-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs: { Icon: IconType; text: string; to: string }[] = [
  { Icon: Home, text: "Discover", to: "/" },
  { Icon: Calendar, text: "Calendar", to: "/calendar" },
  { Icon: People, text: "Councils", to: "/councils" },
  { Icon: ProfileCircle, text: "Profile", to: "/profile" },
];

export default function FooterNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pointer-events-none z-20">
      <div className="bg-card/80 rounded-2xl flex items-center justify-around p-2 shadow-2xl pointer-events-auto border border-border">
        {tabs.map(({ Icon, text, to }) => {
          const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link key={to} href={to}>
              {isActive ? (
                <div className="flex items-center gap-2 bg-foreground rounded-full px-4 py-2.5">
                  <Icon variant="Bold" size={17} color="#b61f2d" />
                  <span className="text-xs font-semibold font-poppins text-background">
                    {text}
                  </span>
                </div>
              ) : (
                <div className="p-2.5">
                  <Icon variant="Linear" size={22} color="#8a8a8a" />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
