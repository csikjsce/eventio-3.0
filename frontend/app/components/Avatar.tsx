"use client";

import { useState } from "react";

/**
 * Avatar that prefers the stored photo (a member's Google profile picture) and
 * falls back to locally-rendered initials — no avatar-service request is made.
 */
export function initialsOf(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  src,
  name,
  className = "",
}: {
  src?: string | null;
  name?: string | null;
  className?: string;
}) {
  // Tracked by URL so a new src always gets a fresh attempt.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src?.trim() || failedSrc === src) {
    return (
      <div
        className={`bg-primary text-white flex items-center justify-center font-poppins font-semibold select-none ${className}`}
        aria-label={name ?? "avatar"}
        title={name ?? undefined}
      >
        <span className="text-[0.7em] leading-none">{initialsOf(name)}</span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={name ?? ""}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
    />
  );
}
