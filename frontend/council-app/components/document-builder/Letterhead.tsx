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
      <div className="grid grid-cols-3 items-center gap-4 min-h-[72px]">
        {/* Eventio mark — left */}
        <div className="flex items-center justify-start">
          <Image
            src="/EventioLogo.svg"
            alt="Eventio"
            width={40}
            height={42}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        {/* Somaiya KJSCE — center aligned */}
        <div className="flex items-center justify-center min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SOMAIYA_KJSCE_LOGO}
            alt="Somaiya Vidyavihar University — K J Somaiya School of Engineering"
            className="h-14 w-auto max-w-[240px] object-contain"
          />
        </div>

        {/* Council letterhead logo — right */}
        <div className="flex items-center justify-end min-w-0">
          {councilLetterheadUrl ? (
            <div className="relative max-h-16 flex items-center justify-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={councilLetterheadUrl}
                alt="Council letterhead"
                className="max-h-16 max-w-[180px] object-contain"
              />
            </div>
          ) : editable ? (
            <label className="cursor-pointer group">
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
              <div className="flex flex-col items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-zinc-500 group-hover:border-red-400 group-hover:text-red-600 transition-colors">
                <Upload size={16} />
                <span className="text-[10px] font-fira text-center leading-snug">
                  {uploading ? "Uploading…" : "Upload letterhead logo"}
                </span>
              </div>
            </label>
          ) : (
            <div className="h-14 w-24 rounded border border-dashed border-zinc-200 bg-zinc-50" />
          )}
        </div>
      </div>
    </header>
  );
}
