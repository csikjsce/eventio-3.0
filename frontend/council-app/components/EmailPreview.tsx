"use client";

import Image from "next/image";

interface Props {
  title: string;
  body: string;
  eventName?: string;
  badge?: string;
}

/** In-app preview matching backend/utils/email-template.js layout. */
export default function EmailPreview({ title, body, eventName, badge = "Event announcement" }: Props) {
  const paragraphs = body.trim().split(/\n{2,}/).filter(Boolean);

  return (
    <div>
      <div className="h-1 bg-gradient-to-r from-[#b61f2d] to-[#ee1d23]" />
      <div className="rounded-b-xl border border-t-0 border-border-c overflow-hidden bg-[#f5f5f7]">
      <div className="bg-white border-b border-[#e4e4e7] px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Image src="/EventioLogo.svg" alt="Eventio" width={32} height={32} className="shrink-0" />
          <div>
            <p className="font-marcellus text-[#b61f2d] text-lg leading-none">Eventio</p>
            <p className="text-[10px] font-fira text-[#71717a] mt-0.5">Somaiya Vidyavihar University</p>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/somaiya-kjsce-logo.png"
          alt="Somaiya Vidyavihar University"
          className="h-12 w-auto max-w-[120px] object-contain shrink-0"
        />
      </div>
      <div className="bg-white px-4 py-4">
        {badge && (
          <p className="text-[10px] font-fira font-semibold uppercase tracking-widest text-[#b61f2d] mb-1.5">
            {badge}
          </p>
        )}
        <h3 className="font-marcellus text-[#18181b] text-xl mb-3">{title.trim() || "Subject line"}</h3>
        {eventName && (
          <p className="text-xs font-fira text-[#52525b] mb-3">
            <span className="font-semibold text-[#18181b]">Event:</span> {eventName}
          </p>
        )}
        {paragraphs.length > 0 ? (
          paragraphs.map((block, i) => (
            <p key={i} className="text-sm font-fira text-[#18181b] leading-relaxed mb-3 last:mb-0 whitespace-pre-wrap">
              {block}
            </p>
          ))
        ) : (
          <p className="text-sm font-fira text-[#71717a] italic">Message preview…</p>
        )}
      </div>
      <div className="bg-[#f5f5f7] border-t border-[#e4e4e7] px-4 py-3">
        <p className="text-[11px] font-fira text-[#71717a] leading-relaxed">
          You received this because you are registered for the event on Eventio.
        </p>
      </div>
      </div>
    </div>
  );
}
