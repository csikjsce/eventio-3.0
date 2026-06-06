"use client";

import Image from "next/image";
import { Upload } from "lucide-react";
import { SOMAIYA_KJSCE_LOGO } from "@/lib/document-builder";

interface Props {
  councilLetterheadUrl?: string;
  onUpload?: (file: File) => void;
  uploading?: boolean;
  editable?: boolean;
}

export default function Letterhead({
  councilLetterheadUrl,
  onUpload,
  uploading = false,
  editable = false,
}: Props) {
  return (
    <header className="border-b border-zinc-300 pb-4 mb-6">
      <div className="flex items-center gap-4 min-h-[72px]">
        {/* Eventio mark — left */}
        <div className="shrink-0 flex items-center justify-center w-12 h-12">
          <Image
            src="/EventioLogo.svg"
            alt="Eventio"
            width={40}
            height={42}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        {/* Somaiya KJSCE — institutional */}
        <div className="shrink-0 flex items-center max-w-[220px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SOMAIYA_KJSCE_LOGO}
            alt="Somaiya Vidyavihar University — K J Somaiya School of Engineering"
            className="h-14 w-auto max-w-[220px] object-contain object-left"
          />
        </div>

        {/* Council letterhead — centre / flex */}
        <div className="flex-1 flex items-center justify-center min-w-0 px-2">
          {councilLetterheadUrl ? (
            <div className="relative w-full max-h-16 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={councilLetterheadUrl}
                alt="Council letterhead"
                className="max-h-16 max-w-full object-contain"
              />
            </div>
          ) : editable ? (
            <label className="w-full max-w-md cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && onUpload) onUpload(file);
                  e.target.value = "";
                }}
              />
              <div className="flex flex-col items-center justify-center gap-1.5 py-3 px-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-zinc-500 group-hover:border-red-400 group-hover:text-red-600 transition-colors">
                <Upload size={18} />
                <span className="text-[11px] font-fira text-center leading-snug">
                  {uploading ? "Uploading…" : "Upload council letterhead"}
                </span>
              </div>
            </label>
          ) : (
            <div className="h-14 w-full max-w-xs rounded border border-dashed border-zinc-200 bg-zinc-50" />
          )}
        </div>
      </div>
    </header>
  );
}
