"use client";

import { ArrowRight2, CallCalling, Clock, Icon as Icontype, Moon, Setting2, Sun } from "iconsax-react";
import Link from "next/link";
import { UserDataContext } from "@/contexts/userContext";
import { useContext } from "react";
import { useTheme, type Theme } from "@/providers/theme-provider";

const themeOptions: { value: Theme; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center">
          {theme === "light" ? (
            <Sun size={20} color="#8a8a8a" />
          ) : (
            <Moon size={20} color="#8a8a8a" />
          )}
        </div>
        <p className="font-poppins text-sm font-medium text-foreground">
          Appearance
        </p>
      </div>
      <div className="flex bg-surface rounded-xl p-1 gap-1">
        {themeOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex-1 py-2 rounded-lg text-xs font-poppins font-medium transition-all ${
              theme === value
                ? "bg-foreground text-background shadow-sm"
                : "text-mute hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfileItem({
  Icon,
  title,
  to,
  danger,
}: {
  Icon: Icontype;
  title: string;
  to: string;
  danger?: boolean;
}) {
  return (
    <Link
      href={to}
      className="flex items-center justify-between bg-card rounded-2xl p-4 border border-border"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${danger ? "bg-primary/10" : "bg-surface"}`}
        >
          <Icon size="20" color={danger ? "#b61f2d" : "#8a8a8a"} />
        </div>
        <p className={`font-poppins text-sm font-medium ${danger ? "text-primary" : "text-foreground"}`}>
          {title}
        </p>
      </div>
      <ArrowRight2 size="18" color="#8a8a8a" />
    </Link>
  );
}

export default function ProfileScreen() {
  const { userData } = useContext(UserDataContext);

  return (
    <div className="pb-36">
      {/* Page title */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground font-poppins">Profile</h1>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <img
          src={userData?.photo_url}
          alt="profile"
          className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/30"
        />
        <div className="text-center">
          <p className="font-poppins font-bold text-xl text-foreground">
            {userData?.name}
          </p>
          <p className="font-poppins text-sm text-mute mt-0.5">{userData?.email}</p>
        </div>

        {/* Stats row */}
        <div className="flex gap-8 mt-2">
          {[
            { label: "Branch", value: userData?.branch || "CE" },
            { label: "Year", value: userData?.year?.toString() || "—" },
            { label: "College", value: userData?.college || "KJSCE" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="font-poppins font-semibold text-foreground text-sm">{value}</p>
              <p className="font-poppins text-xs text-mute">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-3">
        <ProfileItem Icon={Clock} title="My Events" to="/profile/myevents" />
        <ProfileItem Icon={Setting2} title="Edit Profile" to="/profile/settings" />
        <ProfileItem
          Icon={CallCalling}
          title="Contact Us"
          to="tel:+918657432101"
        />
        <ThemeToggle />
      </div>

      {/* Credits */}
      <div className="mt-10 flex flex-col items-center gap-1.5">
        <p className="font-poppins text-xs text-mute">Built &amp; maintained by</p>
        <p className="font-poppins font-semibold text-sm text-foreground tracking-wide">
          CSI KJSCE
        </p>
        <p className="font-poppins text-xs text-mute/60">
          Eventio v3.0
        </p>
      </div>
    </div>
  );
}
