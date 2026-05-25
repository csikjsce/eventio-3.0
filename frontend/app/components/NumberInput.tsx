"use client";

interface Props {
  value: number | string;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
}

export default function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  className = "",
}: Props) {
  const num = Number(value) || 0;

  const increment = () => {
    const next = parseFloat((num + step).toFixed(10));
    if (max === undefined || next <= max) onChange(next);
  };
  const decrement = () => {
    const next = parseFloat((num - step).toFixed(10));
    if (min === undefined || next >= min) onChange(next);
  };

  return (
    <div className={`flex rounded-xl overflow-hidden border border-border bg-surface focus-within:border-primary/60 transition-colors ${className}`}>
      <input
        type="number"
        value={value === 0 ? "" : value}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="flex-1 min-w-0 bg-transparent px-4 py-3 text-sm font-poppins text-foreground placeholder:text-mute outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className="flex flex-col shrink-0 border-l border-border">
        <button
          type="button"
          onClick={increment}
          tabIndex={-1}
          className="flex-1 w-9 flex items-center justify-center text-mute hover:text-foreground hover:bg-surface/80 transition-colors"
          aria-label="Increase"
        >
          <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
            <path d="M1 6L5 2L9 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="h-px bg-border shrink-0" />
        <button
          type="button"
          onClick={decrement}
          tabIndex={-1}
          className="flex-1 w-9 flex items-center justify-center text-mute hover:text-foreground hover:bg-surface/80 transition-colors"
          aria-label="Decrease"
        >
          <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
