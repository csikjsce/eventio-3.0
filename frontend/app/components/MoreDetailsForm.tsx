"use client";

import type { RegistrationField } from "@/lib/registration-fields";

const INPUT =
  "w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white placeholder-gray-400 border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none";

interface Props {
  fields: RegistrationField[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  className?: string;
}

export default function MoreDetailsForm({
  fields,
  values,
  onChange,
  className = "",
}: Props) {
  if (!fields.length) return null;

  function setValue(id: string, value: string) {
    onChange({ ...values, [id]: value });
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm text-gray-300 font-fira mb-1.5">
            {field.label}
            {field.required !== false && (
              <span className="text-red-400 ml-0.5">*</span>
            )}
          </label>
          {field.type === "textarea" ? (
            <textarea
              name={field.id}
              value={values[field.id] ?? ""}
              onChange={(e) => setValue(field.id, e.target.value)}
              placeholder={field.placeholder ?? field.label}
              rows={3}
              required={field.required !== false}
              className={`${INPUT} resize-none`}
            />
          ) : field.type === "select" ? (
            <select
              name={field.id}
              value={values[field.id] ?? ""}
              onChange={(e) => setValue(field.id, e.target.value)}
              required={field.required !== false}
              className={INPUT}
            >
              <option value="">Select…</option>
              {(field.options ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={
                field.type === "number"
                  ? "number"
                  : field.type === "url"
                    ? "url"
                    : "text"
              }
              name={field.id}
              value={values[field.id] ?? ""}
              onChange={(e) => setValue(field.id, e.target.value)}
              placeholder={field.placeholder ?? field.label}
              required={field.required !== false}
              className={INPUT}
            />
          )}
        </div>
      ))}
    </div>
  );
}
