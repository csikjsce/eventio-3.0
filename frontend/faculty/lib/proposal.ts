import { api } from "@/lib/api";
import { getSignaturePngUrl } from "@/lib/signature";

export interface AssignedFacultyReviewer {
  name: string;
  email: string;
  designation?: string;
  dept?: string;
}

export interface ProposalDocumentState {
  kind: "permission_letter" | "report";
  permissionTemplate?: string;
  letterheadUrl?: string;
  signatories: Array<{
    memberId?: number;
    name: string;
    role: string;
    email?: string;
    facultyReviewer?: boolean;
    signatureUrl?: string;
    signedAt?: string;
  }>;
  permission: Record<string, string>;
  report: Record<string, string>;
  assignedFacultyReviewers?: AssignedFacultyReviewer[];
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

function normEmail(email: string) {
  return email.trim().toLowerCase();
}

function mergeCouncilSignatures(
  document: ProposalDocumentState,
  councilSignatures: ProposalPackage["councilSignatures"],
): ProposalDocumentState {
  const map = new Map(
    (councilSignatures ?? []).map((s) => [
      s.memberId != null ? `member:${s.memberId}` : `name:${s.name.trim().toLowerCase()}`,
      s,
    ]),
  );
  return {
    ...document,
    signatories: document.signatories.map((sig) => {
      if (sig.facultyReviewer) return sig;
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

function facultyReviewersToSignatories(
  reviewers: AssignedFacultyReviewer[],
): ProposalDocumentState["signatories"] {
  return reviewers.map((r) => ({
    name: r.name,
    email: r.email.trim(),
    role: r.designation?.trim() || "Faculty Advisor",
    facultyReviewer: true,
  }));
}

function applyFacultyReviewersToDocument(
  doc: ProposalDocumentState,
  reviewers: AssignedFacultyReviewer[],
): ProposalDocumentState {
  const councilSignatories = doc.signatories.filter((s) => !s.facultyReviewer);
  if (reviewers.length === 0) {
    return { ...doc, assignedFacultyReviewers: [], signatories: councilSignatories };
  }

  const existingByEmail = new Map(
    doc.signatories
      .filter((s) => s.facultyReviewer && s.email)
      .map((s) => [normEmail(s.email!), s]),
  );

  const facultySignatories = facultyReviewersToSignatories(reviewers).map((f) => {
    const prev = existingByEmail.get(normEmail(f.email!));
    if (!prev?.signatureUrl) return f;
    return { ...f, signatureUrl: prev.signatureUrl, signedAt: prev.signedAt };
  });

  return {
    ...doc,
    assignedFacultyReviewers: reviewers,
    signatories: [...councilSignatories, ...facultySignatories],
  };
}

export function mergeProposalSignatories(
  proposal: ProposalPackage,
  facultyReviewers?: AssignedFacultyReviewer[],
): ProposalDocumentState | null {
  if (!proposal.document) return null;

  let doc = mergeCouncilSignatures(
    proposal.document,
    proposal.councilSignatures ?? [],
  );

  const reviewers = facultyReviewers ?? doc.assignedFacultyReviewers ?? [];
  if (reviewers.length > 0) {
    doc = applyFacultyReviewersToDocument(doc, reviewers);
  }

  const facultySigByEmail = new Map(
    (proposal.facultySignatures ?? []).map((s) => [normEmail(s.email), s]),
  );

  return {
    ...doc,
    signatories: doc.signatories.map((s) => {
      if (!s.facultyReviewer || !s.email) return s;
      const saved = facultySigByEmail.get(normEmail(s.email));
      if (!saved) return s;
      return { ...s, signatureUrl: saved.png_url, signedAt: saved.signed_at };
    }),
  };
}

/** @deprecated Use mergeProposalSignatories */
export function mergeSignaturesIntoDocument(
  proposal: ProposalPackage,
  facultyReviewers?: AssignedFacultyReviewer[],
): ProposalDocumentState | null {
  return mergeProposalSignatories(proposal, facultyReviewers);
}

export async function fetchProposal(eventId: string | number): Promise<{
  proposal: ProposalPackage;
  assigned_faculty_reviewers: AssignedFacultyReviewer[];
}> {
  const res = await api.get(`/event/p/proposal/${eventId}`);
  return {
    proposal: res.data.proposal,
    assigned_faculty_reviewers: res.data.assigned_faculty_reviewers ?? [],
  };
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
