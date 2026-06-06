"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  type RegistrationField,
  type RegistrationFieldType,
  FIELD_TYPE_OPTIONS,
  createEmptyField,
  slugifyFieldId,
} from "@/lib/registration-fields";

const INPUT =
  "w-full bg-zinc-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm font-fira text-zinc-100 outline-none focus:border-red-500/50 placeholder:text-zinc-600";
const SELECT =
  "bg-zinc-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm font-fira text-zinc-100 outline-none focus:border-red-500/50";

interface Props {
  fields: RegistrationField[];
  onChange: (fields: RegistrationField[]) => void;
}

export default function RegistrationFieldsEditor({ fields, onChange }: Props) {
  function updateField(index: number, patch: Partial<RegistrationField>) {
    const next = fields.map((f, i) => {
      if (i !== index) return f;
      const updated = { ...f, ...patch };
      if (patch.label !== undefined && (!f.id || f.id === slugifyFieldId(f.label))) {
        updated.id = slugifyFieldId(patch.label);
      }
      return updated;
    });
    onChange(next);
  }

  function addField() {
    onChange([...fields, createEmptyField()]);
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3 mt-3">
      <p className="text-zinc-500 text-xs font-fira">
        Add any questions or inputs you want students to fill during registration — e.g. T-shirt size, dietary preference, GitHub handle, year of study.
      </p>

      {fields.length === 0 && (
        <p className="text-zinc-600 text-xs font-fira italic py-2">
          No fields yet. Click &quot;Add field&quot; to create your first question.
        </p>
      )}

      {fields.map((field, index) => (
        <div
          key={index}
          className="rounded-xl border border-white/10 bg-zinc-900/40 p-4 space-y-3"
        >
          <div className="flex items-start gap-2">
            <GripVertical size={16} className="text-zinc-600 mt-2 shrink-0" />
            <div className="flex-1 space-y-3 min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 text-xs font-fira mb-1 block">
                    Question / label *
                  </label>
                  <input
                    className={INPUT}
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder="e.g. GitHub username"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 text-xs font-fira mb-1 block">
                    Input type
                  </label>
                  <select
                    className={`${SELECT} w-full`}
                    value={field.type}
                    onChange={(e) =>
                      updateField(index, {
                        type: e.target.value as RegistrationFieldType,
                        ...(e.target.value !== "select" ? { options: undefined } : {}),
                      })
                    }
                  >
                    {FIELD_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 text-xs font-fira mb-1 block">
                  Placeholder (optional)
                </label>
                <input
                  className={INPUT}
                  value={field.placeholder ?? ""}
                  onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  placeholder="Hint text shown inside the input"
                />
              </div>

              {field.type === "select" && (
                <div>
                  <label className="text-zinc-400 text-xs font-fira mb-1 block">
                    Options (one per line) *
                  </label>
                  <textarea
                    className={`${INPUT} resize-none min-h-[72px]`}
                    value={(field.options ?? []).join("\n")}
                    onChange={(e) =>
                      updateField(index, {
                        options: e.target.value
                          .split("\n")
                          .map((l) => l.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder={"S\nM\nL\nXL"}
                  />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="accent-red-600 w-4 h-4"
                  checked={field.required !== false}
                  onChange={(e) => updateField(index, { required: e.target.checked })}
                />
                <span className="text-zinc-400 text-xs font-fira">Required</span>
              </label>
            </div>
            <button
              type="button"
              onClick={() => removeField(index)}
              className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              aria-label="Remove field"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addField}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-white/15 text-zinc-400 hover:text-zinc-200 hover:border-red-500/30 text-sm font-fira transition-colors"
      >
        <Plus size={16} />
        Add field
      </button>
    </div>
  );
}
