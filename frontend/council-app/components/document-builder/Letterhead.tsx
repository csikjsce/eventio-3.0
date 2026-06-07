"use client";

import Image from "next/image";
import { SOMAIYA_KJSCE_LOGO } from "@/lib/document-builder";

interface Props {
  councilLetterheadUrl?: string;
  /** Full width for document preview; compact read-only strip for sidebar. */
  variant?: "document" | "compact";
}

export default function Letterhead({
  councilLetterheadUrl,
  variant = "document",
}: Props) {
  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-border-c bg-white overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#b61f2d] to-[#ee1d23]" />
        <div className="flex items-center gap-2 px-3 py-2.5 min-w-0">
          <Image
            src="/EventioLogo.svg"
            alt="Eventio"
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 object-contain"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SOMAIYA_KJSCE_LOGO}
            alt="Somaiya"
            className="h-8 flex-1 min-w-0 max-w-[110px] mx-auto object-contain"
          />
          {councilLetterheadUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={councilLetterheadUrl}
              alt="Council logo"
              className="h-8 w-auto max-w-[72px] shrink-0 object-contain"
            />
          ) : (
            <div className="h-8 w-16 shrink-0 rounded border border-dashed border-zinc-300 bg-zinc-50 flex items-center justify-center">
              <span className="text-[8px] font-fira text-zinc-400 leading-none text-center px-0.5">Your logo</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <header className="border-b border-zinc-300 pb-4 mb-6">
      <div className="flex items-center gap-3 min-h-[72px] min-w-0">
        <div className="shrink-0 w-10 flex items-center justify-start">
          <Image
            src="/EventioLogo.svg"
            alt="Eventio"
            width={40}
            height={42}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        <div className="flex-1 min-w-0 flex items-center justify-center px-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SOMAIYA_KJSCE_LOGO}
            alt="Somaiya Vidyavihar University — K J Somaiya School of Engineering"
            className="h-14 w-auto max-w-full object-contain"
          />
        </div>

        <div className="shrink-0 w-[88px] sm:w-[120px] flex items-center justify-end">
          {councilLetterheadUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={councilLetterheadUrl}
              alt="Council letterhead"
              className="max-h-16 max-w-full object-contain object-right"
            />
          ) : (
            <div className="h-14 w-full max-w-[88px] rounded border border-dashed border-zinc-200 bg-zinc-50" />
          )}
        </div>
      </div>
    </header>
  );
}
