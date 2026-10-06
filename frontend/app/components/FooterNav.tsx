"use client";

import { Calendar, Home, Icon as IconType, People, ProfileCircle } from "iconsax-react";
import { usePathname } from "next/navigation";
import PillButton from "@/components/PillButton";

const tabs: { Icon: IconType; text: string; to: string }[] = [
  { Icon: Home, text: "Discover", to: "/" },
  { Icon: Calendar, text: "Calendar", to: "/calendar" },
  { Icon: People, text: "Councils", to: "/councils" },
  { Icon: ProfileCircle, text: "Profile", to: "/profile" },
];

const ACCENT = "#b61f2d";

export default function FooterNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pointer-events-none z-20">
      <div className="bg-card/70 backdrop-blur-xl backdrop-saturate-150 rounded-2xl flex items-center justify-around p-2 shadow-2xl pointer-events-auto border border-border/60">
        {tabs.map(({ Icon, text, to }) => {
          const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
          const content = (hover: boolean) =>
            isActive ? (
              <span className="flex items-center gap-2">
                <Icon variant="Bold" size={17} color={hover ? "#fff" : ACCENT} />
                <span className={`text-xs font-semibold font-poppins ${hover ? "text-white" : "text-background"}`}>
                  {text}
                </span>
              </span>
            ) : (
              <>
                {/* Below md: icon only */}
                <span className="flex md:hidden">
                  <Icon variant={hover ? "Bold" : "Linear"} size={22} color={hover ? "#fff" : "#8a8a8a"} />
                </span>
                {/* md and up: icon + label, same layout as the active pill */}
                <span className="hidden md:flex items-center gap-2">
                  <Icon variant={hover ? "Bold" : "Linear"} size={17} color={hover ? "#fff" : "#8a8a8a"} />
                  <span className={`text-xs font-semibold font-poppins ${hover ? "text-white" : "text-mute"}`}>
                    {text}
                  </span>
                </span>
              </>
            );

          return (
            <PillButton
              key={to}
              href={to}
              active={isActive}
              ariaLabel={text}
              hoverContent={content(true)}
              className={`rounded-full ${isActive ? "bg-foreground px-4 py-2.5" : "p-2.5 md:px-4 md:py-2.5"}`}
            >
              {content(false)}
            </PillButton>
          );
        })}
      </div>
    </div>
  );
}
