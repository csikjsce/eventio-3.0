export interface FacultySignatureRecord {
  png_url: string;
  updated_at?: string;
}

export function getSignaturePngUrl(signature: unknown): string | null {
  if (!signature || typeof signature !== "object" || Array.isArray(signature)) return null;
  const url = (signature as FacultySignatureRecord).png_url;
  return typeof url === "string" && url.trim() ? url.trim() : null;
}

export function buildSignaturePayload(pngUrl: string): FacultySignatureRecord {
  return { png_url: pngUrl, updated_at: new Date().toISOString() };
}
