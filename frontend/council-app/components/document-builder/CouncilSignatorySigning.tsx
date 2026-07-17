"use client";

import { useState } from "react";
import { CheckCircle2, PenLine, Upload } from "lucide-react";
import SignaturePad from "@/components/SignaturePad";
import type { DocumentSignatory } from "@/lib/document-builder";

function SignPanel({
  onApply,
  busy,
}: {
  onApply: (dataUrl: string) => void;
  busy: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  async function handleUpload(file: File) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
    setDraft(dataUrl);
  }

  return (
    <div className="pt-2 border-t border-border-c mt-2 space-y-2">
      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-red-500/30 cursor-pointer">
        <Upload size={14} className="text-red-500" />
        Upload signature PNG
        <input
          type="file"
          accept="image/png,image/webp,image/jpeg"
          className="hidden"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              await handleUpload(file);
            } finally {
              e.target.value = "";
            }
          }}
        />
      </label>
      <SignaturePad onChange={setDraft} />
      <button
        type="button"
        disabled={!draft || busy}
        onClick={() => draft && onApply(draft)}
        className="w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-xs font-fira font-medium"
      >
        Apply signature
      </button>
    </div>
  );
}

export default function CouncilSignatorySigning({
  signatories,
  onSign,
  disabled,
}: {
  signatories: DocumentSignatory[];
  onSign: (index: number, dataUrl: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const required = signatories.filter((s) => s.name.trim() && !s.facultyReviewer);
  if (required.length === 0) return null;

  async function applySign(index: number, dataUrl: string | null) {
    if (!dataUrl) return;
    setBusy(true);
    try {
      await onSign(index, dataUrl);
      setActiveIndex(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-surface border border-border-c rounded-2xl p-5 space-y-3">
      <p className="text-tx text-sm font-fira font-semibold">Council signatures</p>
      <p className="text-muted-tx text-xs font-fira leading-relaxed">
        Each selected signatory must sign before submitting to faculty.
      </p>

      <div className="space-y-2">
        {signatories.map((sig, index) => {
          if (!sig.name.trim() || sig.facultyReviewer) return null;
          const signed = !!sig.signatureUrl;
          return (
            <div
              key={`${sig.memberId ?? "custom"}-${index}`}
              className="rounded-xl border border-border-c p-3"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-fira font-semibold text-tx truncate">{sig.name}</p>
                  {sig.role && (
                    <p className="text-[11px] font-fira text-muted-tx truncate">{sig.role}</p>
                  )}
                </div>
                {signed ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-fira text-emerald-600 shrink-0">
                    <CheckCircle2 size={13} /> Signed
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={disabled || busy}
                    onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-500/30 text-red-600 text-[11px] font-fira hover:bg-red-500/5 shrink-0"
                  >
                    <PenLine size={12} /> Sign
                  </button>
                )}
              </div>

              {signed && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={sig.signatureUrl} alt="" className="h-10 object-contain" />
              )}

              {activeIndex === index && !signed && (
                <SignPanel busy={busy} onApply={(dataUrl) => applySign(index, dataUrl)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
