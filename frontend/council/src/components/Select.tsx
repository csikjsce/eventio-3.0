import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  /** visual size variant */
  size?: 'sm' | 'md';
}

export default function Select({ value, onChange, options, placeholder, className = '', size = 'md' }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  const selected = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3 py-2.5 text-sm';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 ${pad} bg-[#252527] border rounded-lg font-fira text-left transition-all outline-none
          ${open ? 'border-red-600/40 ring-2 ring-red-600/10' : 'border-white/[0.06] hover:border-white/15'}`}
      >
        <span className={selected ? 'text-white' : 'text-zinc-600'}>
          {selected ? selected.label : (placeholder ?? 'Select…')}
        </span>
        <ChevronDown
          size={size === 'sm' ? 12 : 14}
          className={`shrink-0 text-zinc-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[10rem] bg-[#1c1c1e] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
          style={{ maxHeight: '260px', overflowY: 'auto' }}>
          {placeholder && (
            <div
              onClick={() => { onChange(''); setOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-fira cursor-pointer select-none transition-colors
                ${!value ? 'text-red-400 bg-red-600/10' : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300'}`}
            >
              {!value && <Check size={12} className="shrink-0" />}
              {placeholder}
            </div>
          )}
          {options.map(opt => {
            const isActive = String(opt.value) === String(value);
            return (
              <div
                key={opt.value}
                onClick={() => { onChange(String(opt.value)); setOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-fira cursor-pointer select-none transition-colors
                  ${isActive
                    ? 'text-red-400 bg-red-600/10'
                    : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
                  }`}
              >
                {isActive
                  ? <Check size={13} className="shrink-0 text-red-500" />
                  : <span className="w-[13px] shrink-0" />
                }
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
