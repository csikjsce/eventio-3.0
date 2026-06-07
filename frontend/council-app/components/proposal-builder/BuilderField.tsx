const INPUT =
  "w-full bg-surface border border-border-c rounded-lg px-3 py-2 text-sm font-fira text-tx outline-none focus:border-red-500/40 placeholder-subtle-tx";
const LABEL = "block text-subtle-tx text-[11px] font-fira uppercase tracking-wide mb-1";

export default function BuilderField({
  label,
  value,
  onChange,
  multiline,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={`${INPUT} resize-y min-h-[80px]`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT}
        />
      )}
    </div>
  );
}

export { INPUT, LABEL };
