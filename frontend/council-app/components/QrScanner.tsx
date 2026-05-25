"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera } from "lucide-react";

interface Props {
  onScan: (data: string) => void;
  onClose: () => void;
}

// Unique div id per mount to avoid conflicts
const READER_ID = "qr-reader-council";

export default function QrScanner({ onScan, onClose }: Props) {
  const [permError, setPermError] = useState("");
  const stoppedRef = useRef(false);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    stoppedRef.current = false;
    let scannerInstance: { stop: () => Promise<void> } | null = null;

    import("html5-qrcode")
      .then(({ Html5Qrcode }) => {
        if (stoppedRef.current) return;
        const scanner = new Html5Qrcode(READER_ID);
        scannerInstance = scanner;

        scanner
          .start(
            { facingMode: "environment" },
            { fps: 12, qrbox: { width: 240, height: 240 } },
            (decodedText) => {
              if (stoppedRef.current) return;
              stoppedRef.current = true;
              scanner.stop().catch(() => {});
              onScanRef.current(decodedText);
            },
            undefined,
          )
          .catch((err: unknown) => {
            const msg = String(err);
            if (msg.toLowerCase().includes("permission")) {
              setPermError("Camera permission denied. Please allow camera access and try again.");
            } else {
              setPermError("Could not start camera: " + msg);
            }
          });
      })
      .catch(() => setPermError("QR scanner library failed to load."));

    return () => {
      stoppedRef.current = true;
      scannerInstance?.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-c)] rounded-2xl overflow-hidden w-full max-w-sm relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-c)]">
          <div className="flex items-center gap-2 text-[var(--color-tx)]">
            <Camera size={16} />
            <span className="font-fira text-sm font-semibold">Scan Attendee QR</span>
          </div>
          <button
            onClick={() => {
              stoppedRef.current = true;
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-[var(--color-surface2)] border border-[var(--color-border-c)] hover:border-red-500/40 flex items-center justify-center text-[var(--color-muted-tx)] hover:text-[var(--color-tx)] transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Camera viewport */}
        {permError ? (
          <div className="p-6 text-center">
            <p className="text-red-400 text-sm font-fira leading-relaxed">{permError}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-red-500 text-white text-sm font-fira rounded-lg"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div id={READER_ID} className="w-full" />
            <p className="text-center text-[var(--color-muted-tx)] text-xs font-fira py-3 px-4">
              Point the camera at the student&apos;s QR code
            </p>
          </>
        )}
      </div>
    </div>
  );
}
