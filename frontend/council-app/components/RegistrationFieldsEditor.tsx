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
  "w-full bg-surface border border-border-c rounded-lg px-3 py-2 text-sm font-fira text-tx outline-none focus:border-red-500/40 placeholder:text-subtle-tx transition-colors";
const SELECT =
  "w-full bg-surface border border-border-c rounded-lg px-3 py-2 text-sm font-fira text-tx outline-none focus:border-red-500/40 transition-colors";
const LABEL = "text-muted-tx text-xs font-fira mb-1 block";

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
      <p className="text-muted-tx text-xs font-fira leading-relaxed">
        Add any questions or inputs you want students to fill during registration — e.g. T-shirt size, dietary preference, GitHub handle, year of study.
      </p>

      {fields.length === 0 && (
        <p className="text-subtle-tx text-xs font-fira italic py-2">
          No fields yet. Click &quot;Add field&quot; to create your first question.
        </p>
      )}

      {fields.map((field, index) => (
        <div
          key={index}
          className="rounded-xl border border-border-c bg-surface2 p-4 space-y-3"
        >
          <div className="flex items-start gap-2">
            <GripVertical size={16} className="text-subtle-tx mt-2 shrink-0" />
            <div className="flex-1 space-y-3 min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Question / label *</label>
                  <input
                    className={INPUT}
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder="e.g. GitHub username"
                  />
                </div>
                <div>
                  <label className={LABEL}>Input type</label>
                  <select
                    className={SELECT}
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
                <label className={LABEL}>Placeholder (optional)</label>
                <input
                  className={INPUT}
                  value={field.placeholder ?? ""}
                  onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  placeholder="Hint text shown inside the input"
                />
              </div>

              {field.type === "select" && (
                <div>
                  <label className={LABEL}>Options (one per line) *</label>
                  <textarea
                    className={`${INPUT} resize-y min-h-[88px]`}
                    rows={4}
                    value={(field.options ?? []).join("\n")}
                    onChange={(e) =>
                      updateField(index, {
                        options: e.target.value.split("\n"),
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.stopPropagation();
                    }}
                    placeholder={"S\nM\nL\nXL"}
                  />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-border-c text-red-500 focus:ring-red-500/30 w-4 h-4"
                  checked={field.required !== false}
                  onChange={(e) => updateField(index, { required: e.target.checked })}
                />
                <span className="text-muted-tx text-xs font-fira">Required</span>
              </label>
            </div>
            <button
              type="button"
              onClick={() => removeField(index)}
              className="p-2 rounded-lg text-muted-tx hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
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
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-border-c text-muted-tx hover:text-tx hover:border-red-500/30 text-sm font-fira transition-colors"
      >
        <Plus size={16} />
        Add field
      </button>
    </div>
  );
}
