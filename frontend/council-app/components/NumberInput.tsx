"use client";

import { forwardRef, useRef } from "react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  className?: string;
};

// forwardRef so react-hook-form's register() works seamlessly
const NumberInput = forwardRef<HTMLInputElement, Props>(function NumberInput(
  { className = "", min, max, step, ...rest },
  forwardedRef,
) {
  const innerRef = useRef<HTMLInputElement>(null);

  // Resolve to whichever ref we can use
  const getInput = (): HTMLInputElement | null => {
    if (typeof forwardedRef === "function") return innerRef.current;
    return (forwardedRef?.current ?? innerRef.current);
  };

  const step_ = (dir: 1 | -1) => {
    const el = getInput();
    if (!el) return;
    const s  = step  !== undefined ? Number(step)  : 1;
    const mn = min   !== undefined ? Number(min)   : undefined;
    const mx = max   !== undefined ? Number(max)   : undefined;
    const cur = parseFloat(el.value) || 0;
    const next = parseFloat((cur + dir * s).toFixed(10));
    if (dir === 1 && mx !== undefined && next > mx) return;
    if (dir === -1 && mn !== undefined && next < mn) return;
    // Use the native value setter so React's synthetic events fire correctly
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(el, String(next));
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const refCallback = (el: HTMLInputElement | null) => {
    (innerRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
    if (typeof forwardedRef === "function") forwardedRef(el);
    else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
  };

  return (
    <div className={`flex rounded-lg overflow-hidden border border-[var(--color-border-c)] bg-[var(--color-surface2)] focus-within:border-red-500/40 transition-colors ${className}`}>
      <input
        ref={refCallback}
        type="number"
        min={min}
        max={max}
        step={step}
        {...rest}
        className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm font-fira text-[var(--color-tx)] placeholder-[var(--color-subtle-tx)] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className="flex flex-col shrink-0 border-l border-[var(--color-border-c)]">
        <button
          type="button"
          tabIndex={-1}
          onClick={() => step_(1)}
          aria-label="Increase"
          className="flex-1 w-8 flex items-center justify-center text-[var(--color-subtle-tx)] hover:text-[var(--color-tx)] hover:bg-[var(--color-surface)] transition-colors"
        >
          <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
            <path d="M1 5L4.5 2L8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="h-px bg-[var(--color-border-c)] shrink-0" />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => step_(-1)}
          aria-label="Decrease"
          className="flex-1 w-8 flex items-center justify-center text-[var(--color-subtle-tx)] hover:text-[var(--color-tx)] hover:bg-[var(--color-surface)] transition-colors"
        >
          <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
            <path d="M1 1L4.5 4L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
});

export default NumberInput;
