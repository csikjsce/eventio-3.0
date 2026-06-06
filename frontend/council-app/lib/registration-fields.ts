export type RegistrationFieldType =
  | "text"
  | "textarea"
  | "url"
  | "number"
  | "select";

export interface RegistrationField {
  id: string;
  label: string;
  type: RegistrationFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export const FIELD_TYPE_OPTIONS: { value: RegistrationFieldType; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "url", label: "URL / link" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
];

export function slugifyFieldId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function createEmptyField(): RegistrationField {
  return {
    id: "",
    label: "",
    type: "text",
    required: true,
    placeholder: "",
  };
}

export function normalizeRegistrationFields(
  fields: RegistrationField[] | undefined | null,
): RegistrationField[] {
  if (!Array.isArray(fields)) return [];

  const seen = new Set<string>();
  return fields
    .map((field) => {
      const label = field.label?.trim() ?? "";
      if (!label) return null;

      let id = field.id?.trim() || slugifyFieldId(label);
      let uniqueId = id;
      let n = 2;
      while (seen.has(uniqueId)) {
        uniqueId = `${id}_${n++}`;
      }
      seen.add(uniqueId);

      const normalized: RegistrationField = {
        id: uniqueId,
        label,
        type: field.type ?? "text",
        required: field.required !== false,
      };

      const placeholder = field.placeholder?.trim();
      if (placeholder) normalized.placeholder = placeholder;

      if (normalized.type === "select") {
        const options = (field.options ?? [])
          .map((o) => o.trim())
          .filter(Boolean);
        if (options.length > 0) normalized.options = options;
      }

      return normalized;
    })
    .filter(Boolean) as RegistrationField[];
}

export function validateRegistrationFieldsEditor(
  fields: RegistrationField[],
): string | null {
  const normalized = normalizeRegistrationFields(fields);
  if (normalized.length === 0) {
    return "Add at least one custom field, or turn off Extra Registration Fields.";
  }
  for (const field of normalized) {
    if (field.type === "select" && (!field.options || field.options.length === 0)) {
      return `Dropdown "${field.label}" needs at least one option.`;
    }
  }
  return null;
}
