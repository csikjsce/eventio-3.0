"use client";
import Image from "next/image";
import { Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggle } = useTheme();
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border-c sticky top-0 z-20">
      <button type="button" onClick={onMenuClick} className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-tx hover:bg-surface2 transition-colors">
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2">
        <Image src="/EventioLogo.svg" alt="Eventio" width={24} height={24} />
        <p className="text-red-500 font-marcellus text-lg leading-none">Eventio</p>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" onClick={toggle} className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-tx hover:bg-surface2 transition-colors">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
