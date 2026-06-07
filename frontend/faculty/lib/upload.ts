const UPLOAD_URL = "https://file-upload.csi-kjsce.workers.dev/";

export type UploadType =
  | "eventio-council-images"
  | "eventio-event-images"
  | "eventio-reports"
  | "eventio-approval-documents";

export async function uploadFile(file: File, type: UploadType): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("type", type);

  const res = await fetch(UPLOAD_URL, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${res.statusText}`);

  const data: { success: boolean; url: string } = await res.json();
  if (!data.success || !data.url) throw new Error("Upload service returned no URL");

  return data.url;
}
