"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera } from "lucide-react";
import jsQR from "jsqr";

interface Props {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QrScanner({ onScan, onClose }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const doneRef   = useRef(false);

  const [permError, setPermError] = useState("");

  // Stop camera + animation frame cleanly
  const cleanup = () => {
    doneRef.current = true;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    doneRef.current = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then(stream => {
        if (doneRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        const video = videoRef.current!;
        video.srcObject = stream;
        video.play().catch(() => {});

        const tick = () => {
          if (doneRef.current) return;
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d", { willReadFrequently: true });
          if (video.readyState === video.HAVE_ENOUGH_DATA && canvas && ctx) {
            canvas.width  = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const result = jsQR(img.data, img.width, img.height, {
              inversionAttempts: "dontInvert",
            });
            if (result?.data) {
              cleanup();
              onScan(result.data);
              return;
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      })
      .catch(err => {
        const msg = String(err);
        if (msg.includes("Permission") || msg.includes("NotAllowed")) {
          setPermError("Camera permission denied. Please allow camera access and try again.");
        } else {
          setPermError("Could not start camera: " + msg);
        }
      });

    return cleanup;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
            type="button"
            onClick={() => { cleanup(); onClose(); }}
            className="w-8 h-8 rounded-lg bg-[var(--color-surface2)] border border-[var(--color-border-c)] hover:border-red-500/40 flex items-center justify-center text-[var(--color-muted-tx)] hover:text-[var(--color-tx)] transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        {permError ? (
          <div className="p-6 text-center">
            <p className="text-red-400 text-sm font-fira leading-relaxed">{permError}</p>
            <button
              type="button"
              onClick={() => { cleanup(); onClose(); }}
              className="mt-4 px-4 py-2 bg-red-500 text-white text-sm font-fira rounded-lg"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Live camera feed */}
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-full block"
              style={{ maxHeight: 300, objectFit: "cover" }}
            />

            {/* Scanning reticle overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-52 h-52 border-2 border-white/60 rounded-2xl" />
            </div>

            {/* Hidden canvas used for frame analysis — never rendered visibly */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {!permError && (
          <p className="text-center text-[var(--color-muted-tx)] text-xs font-fira py-3 px-4">
            Point the camera at the student&apos;s QR code
          </p>
        )}
      </div>
    </div>
  );
}
