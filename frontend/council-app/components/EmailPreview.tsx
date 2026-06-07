"use client";

import Image from "next/image";
import { renderEmailBodyHtml, type EmailBodyFormat } from "@/lib/email-body";

interface Props {
  title: string;
  body: string;
  eventName?: string;
  badge?: string;
  bodyFormat?: EmailBodyFormat;
}

/** In-app preview matching backend/utils/email-template.js layout. */
export default function EmailPreview({
  title,
  body,
  eventName,
  badge = "Event announcement",
  bodyFormat = "plain",
}: Props) {
  const bodyHtml = renderEmailBodyHtml(body, bodyFormat);
  const isRich = bodyFormat !== "plain";

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
          {bodyHtml ? (
            isRich ? (
              <div
                className="email-body-preview text-sm font-fira text-[#18181b] leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_a]:text-[#b61f2d] [&_a]:underline [&_h1]:font-marcellus [&_h2]:font-marcellus [&_h3]:font-marcellus [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h1]:mb-2 [&_h2]:mb-2 [&_h3]:mb-2 [&_strong]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-[#e4e4e7] [&_blockquote]:pl-3 [&_blockquote]:text-[#52525b]"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : (
              body
                .trim()
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((block, i) => (
                  <p
                    key={i}
                    className="text-sm font-fira text-[#18181b] leading-relaxed mb-3 last:mb-0 whitespace-pre-wrap"
                  >
                    {block}
                  </p>
                ))
            )
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
