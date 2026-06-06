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

export function buildInitialAnswers(
  fields: RegistrationField[],
): Record<string, string> {
  return Object.fromEntries(fields.map((f) => [f.id, ""]));
}

export function validateClientAnswers(
  fields: RegistrationField[],
  answers: Record<string, string>,
): string | null {
  for (const field of fields) {
    const value = (answers[field.id] ?? "").trim();
    if (field.required !== false && !value) {
      return `"${field.label}" is required`;
    }
    if (!value) continue;
    if (field.type === "url") {
      try {
        new URL(value);
      } catch {
        return `"${field.label}" must be a valid URL`;
      }
    }
    if (field.type === "number" && Number.isNaN(Number(value))) {
      return `"${field.label}" must be a number`;
    }
    if (
      field.type === "select" &&
      field.options?.length &&
      !field.options.includes(value)
    ) {
      return `"${field.label}" has an invalid selection`;
    }
  }
  return null;
}
