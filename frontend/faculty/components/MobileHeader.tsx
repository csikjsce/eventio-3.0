"use client";

import Image from "next/image";
import { Menu } from "lucide-react";

export default function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border lg:hidden">
      <button type="button" onClick={onMenuClick}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2">
        <Image src="/EventioLogo.svg" alt="Eventio" width={24} height={24} />
        <p className="text-sky-500 font-semibold text-lg leading-none">Eventio</p>
      </div>
      <div className="w-9" />
    </header>
  );
}
