"use client";
interface Option { value: string; label: string }
interface Props {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  size?: "sm" | "md";
}
export default function Select({ value, onChange, options, placeholder, size = "md" }: Props) {
  const cls = size === "sm"
    ? "bg-surface2 border border-border-c focus:border-red-500/50 rounded-lg px-3 py-1.5 text-xs font-fira text-tx outline-none transition-colors"
    : "bg-surface2 border border-border-c focus:border-red-500/50 rounded-lg px-3 py-2 text-sm font-fira text-tx outline-none transition-colors";
  return (
    <select className={cls} value={value} onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
