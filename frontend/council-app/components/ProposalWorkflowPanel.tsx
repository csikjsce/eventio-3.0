"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Circle,
  FileText,
  Loader2,
  Send,
} from "lucide-react";
import CouncilSignatorySigning from "@/components/document-builder/CouncilSignatorySigning";
import FacultyReviewerSelect from "@/components/FacultyReviewerSelect";
import ProposalDocumentView from "@/components/ProposalDocumentView";
import type { FacultyAdvisorRow } from "@/lib/api";
import type { DocumentBuilderState } from "@/lib/document-builder";
import {
  allCouncilSigned,
  councilSignaturesFromDocument,
  dataUrlToFile,
  fetchProposal,
  mergeCouncilSignatures,
  resolveFacultyReviewers,
  applyFacultyReviewersToDocument,
  saveProposal,
  submitProposal,
  type ProposalPackage,
} from "@/lib/proposal";
import { uploadFile } from "@/lib/upload";

function StepRow({
  done,
  label,
  hint,
}: {
  done: boolean;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      {done ? (
        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
      ) : (
        <Circle size={16} className="text-muted-tx shrink-0 mt-0.5" />
      )}
      <div>
        <p className={`text-sm font-fira ${done ? "text-tx" : "text-muted-tx"}`}>{label}</p>
        {hint && !done && (
          <p className="text-[11px] font-fira text-subtle-tx mt-0.5">{hint}</p>
        )}
      </div>
    </div>
  );
}

export default function ProposalWorkflowPanel({
  eventId,
  resubmit,
  advisors,
  selectedFaculty,
  onFacultyChange,
  onSubmitted,
  onError,
}: {
  eventId: number | string;
  resubmit?: boolean;
  advisors: FacultyAdvisorRow[];
  selectedFaculty: string[];
  onFacultyChange: (emails: string[]) => void;
  onSubmitted: () => void;
  onError: (msg: string) => void;
}) {
  const [proposal, setProposal] = useState<ProposalPackage | null>(null);
  const [docState, setDocState] = useState<DocumentBuilderState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const reload = useCallback(async () => {
    const { proposal: pkg, assigned_faculty_emails } = await fetchProposal(eventId);
    setProposal(pkg);
    if (pkg.document) {
      setDocState(
        mergeCouncilSignatures(
          { ...pkg.document, eventId: String(eventId) },
          pkg.councilSignatures ?? [],
        ),
      );
    } else {
      setDocState(null);
    }
    if (assigned_faculty_emails?.length && selectedFaculty.length === 0) {
      onFacultyChange(assigned_faculty_emails);
    }
  }, [eventId, onFacultyChange, selectedFaculty.length]);

  useEffect(() => {
    setLoading(true);
    reload()
      .catch(() => onError("Could not load proposal."))
      .finally(() => setLoading(false));
  }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasDoc = !!docState && !!proposal?.document;
  const allSigned = docState ? allCouncilSigned(docState) : false;
  const facultyOk = selectedFaculty.length > 0;
  const canSubmit = hasDoc && allSigned && facultyOk;
  const previewReviewers = resolveFacultyReviewers(advisors, selectedFaculty);

  async function persistDocument(next: DocumentBuilderState) {
    const reviewers = resolveFacultyReviewers(advisors, selectedFaculty);
    const withFaculty = applyFacultyReviewersToDocument(next, reviewers);
    setDocState(withFaculty);
    await saveProposal(
      eventId,
      withFaculty,
      councilSignaturesFromDocument(withFaculty),
    );
    const { proposal: pkg } = await fetchProposal(eventId);
    setProposal(pkg);
  }

  async function handleSign(index: number, dataUrl: string) {
    if (!docState) return;
    const sig = docState.signatories[index];
    const file = dataUrlToFile(dataUrl, `council-sig-${sig.memberId ?? index}.png`);
    const url = await uploadFile(file, "eventio-council-images");
    const next: DocumentBuilderState = {
      ...docState,
      signatories: docState.signatories.map((x, i) =>
        i === index ? { ...x, signatureUrl: url, signedAt: new Date().toISOString() } : x,
      ),
    };
    setBusy(true);
    try {
      await persistDocument(next);
    } catch {
      onError("Could not save signature.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    if (!docState || !canSubmit) return;
    setBusy(true);
    try {
      const reviewers = resolveFacultyReviewers(advisors, selectedFaculty);
      const withFaculty = applyFacultyReviewersToDocument(docState, reviewers);
      await saveProposal(
        eventId,
        withFaculty,
        councilSignaturesFromDocument(withFaculty),
      );
      await submitProposal(eventId, selectedFaculty);
      onSubmitted();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      onError(msg ?? "Submit failed — complete the proposal and signatures first.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border p-5 bg-surface border-border-c flex items-center justify-center gap-2 text-muted-tx text-sm font-fira">
        <Loader2 size={16} className="animate-spin" /> Loading proposal…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-5 bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20 space-y-4">
      <div className="flex items-start gap-3">
        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-tx text-sm font-fira font-semibold mb-1">
            {resubmit ? "Resubmit to faculty" : "Submit for faculty approval"}
          </p>
          <p className="text-muted-tx text-xs font-fira leading-relaxed">
            Build your permission letter, collect council signatures, choose faculty reviewers,
            then submit — all from this page.
          </p>
        </div>
      </div>

      <div className="space-y-2.5 pl-1">
        <StepRow
          done={hasDoc}
          label="Proposal document saved"
          hint="Compose the letter in Doc Builder and save it to this event."
        />
        <StepRow
          done={allSigned}
          label="All council signatories signed"
          hint="Each person listed on the letter must sign below."
        />
        <StepRow
          done={facultyOk}
          label="Faculty reviewers selected"
          hint="Pick who should review this proposal."
        />
      </div>

      {!hasDoc ? (
        <Link
          href={`/document-builder?eventId=${eventId}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-fira font-semibold bg-red-500 hover:bg-red-600 text-white transition-all"
        >
          <FileText size={15} /> Open Doc Builder
          <ChevronRight size={14} />
        </Link>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/document-builder?eventId=${eventId}`}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-fira border border-border-c bg-surface hover:border-red-500/30 text-tx transition-all"
            >
              <FileText size={14} /> Edit in Doc Builder
            </Link>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="flex-1 min-w-[140px] py-2 rounded-xl text-xs font-fira border border-border-c bg-surface hover:border-red-500/30 text-tx transition-all"
            >
              {showPreview ? "Hide preview" : "Preview letter"}
            </button>
          </div>

          {showPreview && proposal && (
            <ProposalDocumentView
              proposal={proposal}
              compact
              facultyReviewers={previewReviewers}
            />
          )}

          {docState && (
            <CouncilSignatorySigning
              signatories={docState.signatories}
              onSign={handleSign}
              disabled={busy}
            />
          )}

          <FacultyReviewerSelect
            advisors={advisors}
            selected={selectedFaculty}
            onChange={onFacultyChange}
            compact
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || busy}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-fira font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-red-500 hover:bg-red-600 text-white"
          >
            {busy ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <Send size={15} />
                {resubmit ? "Resubmit to faculty" : "Submit to faculty"}
              </>
            )}
          </button>

          {!canSubmit && hasDoc && (
            <p className="text-[11px] font-fira text-muted-tx text-center">
              Complete all steps above before submitting.
            </p>
          )}
        </>
      )}
    </div>
  );
}
