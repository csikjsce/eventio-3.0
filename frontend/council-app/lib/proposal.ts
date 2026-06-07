import { api } from "@/lib/api";
import type { DocumentBuilderState } from "@/lib/document-builder";

export interface CouncilSignatureRecord {
  memberId?: number;
  name: string;
  role: string;
  png_url: string;
  signed_at: string;
}

export interface FacultySignatureRecord {
  user_id: number;
  name: string;
  email: string;
  png_url: string;
  signed_at: string;
}

export interface ProposalPackage {
  version: number;
  document: DocumentBuilderState | null;
  councilSignatures: CouncilSignatureRecord[];
  facultySignatures: FacultySignatureRecord[];
  submittedAt?: string | null;
}

function sigKey(sig: { memberId?: number; name: string }) {
  if (sig.memberId != null) return `member:${sig.memberId}`;
  return `name:${sig.name.trim().toLowerCase()}`;
}

export function mergeCouncilSignatures(
  document: DocumentBuilderState,
  councilSignatures: CouncilSignatureRecord[],
): DocumentBuilderState {
  const map = new Map(
    councilSignatures.map((s) => [
      sigKey({ memberId: s.memberId, name: s.name }),
      s,
    ]),
  );

  return {
    ...document,
    signatories: document.signatories.map((sig) => {
      const saved = map.get(sigKey({ memberId: sig.memberId, name: sig.name }));
      if (!saved) return sig;
      return {
        ...sig,
        signatureUrl: saved.png_url,
        signedAt: saved.signed_at,
      };
    }),
  };
}

export function councilSignaturesFromDocument(
  document: DocumentBuilderState,
): CouncilSignatureRecord[] {
  return document.signatories
    .filter((s) => s.signatureUrl)
    .map((s) => ({
      memberId: s.memberId,
      name: s.name,
      role: s.role,
      png_url: s.signatureUrl!,
      signed_at: s.signedAt ?? new Date().toISOString(),
    }));
}

export function allCouncilSigned(document: DocumentBuilderState): boolean {
  const required = document.signatories.filter((s) => s.name.trim());
  if (required.length === 0) return false;
  return required.every((s) => !!s.signatureUrl);
}

export async function fetchProposal(eventId: string | number): Promise<{
  proposal: ProposalPackage;
  event_state: string;
  assigned_faculty_emails: string[];
}> {
  const res = await api.get(`/event/p/proposal/${eventId}`);
  return {
    proposal: res.data.proposal,
    event_state: res.data.event_state,
    assigned_faculty_emails: res.data.assigned_faculty_emails ?? [],
  };
}

export async function saveProposal(
  eventId: string | number,
  document: DocumentBuilderState,
  councilSignatures: CouncilSignatureRecord[],
): Promise<ProposalPackage> {
  const res = await api.put(`/event/p/proposal/${eventId}`, {
    document,
    councilSignatures,
  });
  return res.data.proposal;
}

export async function submitProposal(
  eventId: string | number,
  assignedFacultyEmails: string[],
): Promise<void> {
  await api.post(`/event/p/proposal/${eventId}/submit`, {
    assigned_faculty_emails: assignedFacultyEmails,
  });
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}
