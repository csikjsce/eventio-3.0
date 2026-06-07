import { api } from "@/lib/api";
import { getSignaturePngUrl } from "@/lib/signature";

export interface ProposalDocumentState {
  kind: "permission_letter" | "report";
  permissionTemplate?: string;
  letterheadUrl?: string;
  signatories: Array<{
    memberId?: number;
    name: string;
    role: string;
    signatureUrl?: string;
    signedAt?: string;
  }>;
  permission: Record<string, string>;
  report: Record<string, string>;
}

export interface ProposalPackage {
  version: number;
  document: ProposalDocumentState | null;
  councilSignatures: Array<{
    memberId?: number;
    name: string;
    role: string;
    png_url: string;
    signed_at: string;
  }>;
  facultySignatures: Array<{
    user_id: number;
    name: string;
    email: string;
    png_url: string;
    signed_at: string;
  }>;
  submittedAt?: string | null;
}

export async function fetchProposal(eventId: string | number): Promise<ProposalPackage> {
  const res = await api.get(`/event/p/proposal/${eventId}`);
  return res.data.proposal;
}

export async function facultySignProposal(
  eventId: string | number,
  options: { approve?: boolean; sendToPrincipal?: boolean },
): Promise<void> {
  await api.post(`/event/p/proposal/${eventId}/faculty-sign`, {
    approve: options.approve === true,
    sendToPrincipal: options.sendToPrincipal === true,
  });
}

export function userHasSignature(signature: unknown): boolean {
  return !!getSignaturePngUrl(signature);
}

export function mergeSignaturesIntoDocument(
  proposal: ProposalPackage,
): ProposalDocumentState | null {
  if (!proposal.document) return null;
  const map = new Map(
    (proposal.councilSignatures ?? []).map((s) => [
      s.memberId != null ? `member:${s.memberId}` : `name:${s.name.trim().toLowerCase()}`,
      s,
    ]),
  );
  return {
    ...proposal.document,
    signatories: proposal.document.signatories.map((sig) => {
      const key =
        sig.memberId != null
          ? `member:${sig.memberId}`
          : `name:${sig.name.trim().toLowerCase()}`;
      const saved = map.get(key);
      if (!saved) return sig;
      return { ...sig, signatureUrl: saved.png_url, signedAt: saved.signed_at };
    }),
  };
}
