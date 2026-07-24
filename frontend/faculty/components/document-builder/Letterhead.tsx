"use client";

import Image from "next/image";

const SOMAIYA_KJSCE_LOGO = "/somaiya-kjsce-logo.png";

interface Props {
  councilLetterheadUrl?: string;
}

export default function Letterhead({ councilLetterheadUrl }: Props) {
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
