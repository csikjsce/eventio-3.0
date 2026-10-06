"use client";

import { gsap } from "gsap";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

const EASE = "power2.out";

type Props = {
  children: ReactNode;
  /** What slides in on hover. Defaults to `children`, shown in white. */
  hoverContent?: ReactNode;
  /** Renders a Next.js <Link> when set, otherwise a <button>. */
  href?: string;
  onClick?: () => void;
  /** Sets aria-current (links) / aria-pressed (buttons) and resets the hover state when it changes. */
  active?: boolean;
  ariaLabel?: string;
  /** Size, padding, shape and colors of the pill itself. */
  className?: string;
  /** Color of the rising circle. */
  fillClassName?: string;
};

// Pill with a GSAP "rising circle" hover fill (React Bits PillNav pattern):
// an accent circle rises from below the pill while the content slides up and
// a white copy slides in to replace it.
export default function PillButton({
  children,
  hoverContent,
  href,
  onClick,
  active = false,
  ariaLabel,
  className = "",
  fillClassName = "bg-primary",
}: Props) {
  const circleRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const hoverRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Rebuilt whenever the pill changes size (breakpoints, fonts, label text) and
  // when `active` flips — that also clears a fill left behind by a tap on touch
  // screens, which never fire mouseleave.
  useEffect(() => {
    const circle = circleRef.current;
    const label = labelRef.current;
    const hover = hoverRef.current;
    const pill = circle?.parentElement;
    if (!circle || !label || !hover || !pill) return;

    const layout = () => {
      const { width: w, height: h } = pill.getBoundingClientRect();
      if (!w || !h) return;
      // Circle through the pill's bottom corners whose top just reaches the pill's top edge.
      const R = (w * w / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - w * w / 4))) + 1;
      circle.style.width = circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;
      gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${D - delta}px` });
      gsap.set(label, { y: 0 });
      gsap.set(hover, { y: h + 12, opacity: 0 });

      tweenRef.current?.kill();
      tlRef.current?.kill();
      const tl = gsap.timeline({ paused: true });
      tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease: EASE, overwrite: "auto" }, 0);
      tl.to(label, { y: -(h + 8), duration: 2, ease: EASE, overwrite: "auto" }, 0);
      tl.to(hover, { y: 0, opacity: 1, duration: 2, ease: EASE, overwrite: "auto" }, 0);
      tlRef.current = tl;
    };

    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(pill);
    return () => {
      observer.disconnect();
      gsap.killTweensOf([circle, label, hover]);
    };
  }, [active]);

  const enter = () => {
    const tl = tlRef.current;
    if (!tl) return;
    tweenRef.current?.kill();
    tweenRef.current = tl.tweenTo(tl.duration(), { duration: 0.3, ease: EASE, overwrite: "auto" });
  };
  const leave = () => {
    const tl = tlRef.current;
    if (!tl) return;
    tweenRef.current?.kill();
    tweenRef.current = tl.tweenTo(0, { duration: 0.2, ease: EASE, overwrite: "auto" });
  };

  const inner = (
    <>
      <span
        ref={circleRef}
        aria-hidden="true"
        className={`absolute left-1/2 rounded-full pointer-events-none ${fillClassName}`}
      />
      <span ref={labelRef} className="relative flex items-center justify-center">
        {children}
      </span>
      <span
        ref={hoverRef}
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center text-white opacity-0"
      >
        {hoverContent ?? children}
      </span>
    </>
  );

  const shared = {
    className: `relative overflow-hidden flex items-center justify-center ${className}`,
    onMouseEnter: enter,
    onMouseLeave: leave,
    onClick,
    "aria-label": ariaLabel,
  };

  return href ? (
    <Link href={href} aria-current={active ? "page" : undefined} {...shared}>
      {inner}
    </Link>
  ) : (
    <button type="button" aria-pressed={active} {...shared}>
      {inner}
    </button>
  );
}
