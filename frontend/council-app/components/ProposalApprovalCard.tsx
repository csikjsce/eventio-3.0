"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { proposalBuilderPath } from "@/lib/proposal-routes";
import {
  allCouncilSigned,
  fetchProposal,
  type ProposalPackage,
} from "@/lib/proposal";

function StepRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-start gap-2.5">
      {done ? (
        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
      ) : (
        <Circle size={16} className="text-muted-tx shrink-0 mt-0.5" />
      )}
      <p className={`text-sm font-fira ${done ? "text-tx" : "text-muted-tx"}`}>{label}</p>
    </div>
  );
}

export default function ProposalApprovalCard({
  eventId,
  resubmit,
  selectedFacultyCount,
}: {
  eventId: number | string;
  resubmit?: boolean;
  selectedFacultyCount?: number;
}) {
  const [proposal, setProposal] = useState<ProposalPackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProposal(eventId)
      .then(({ proposal: pkg }) => setProposal(pkg))
      .catch(() => setProposal(null))
      .finally(() => setLoading(false));
  }, [eventId]);

  const hasDoc = !!proposal?.document;
  const allSigned = proposal?.document ? allCouncilSigned(proposal.document) : false;
  const facultyOk = (selectedFacultyCount ?? 0) > 0;
  const ready = hasDoc && allSigned && facultyOk;

  if (loading) {
    return (
      <div className="rounded-2xl border p-5 bg-surface border-border-c flex items-center justify-center gap-2 text-muted-tx text-sm font-fira">
        <Loader2 size={16} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-5 bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20 space-y-4">
      <div className="flex items-start gap-3">
        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-tx text-sm font-fira font-semibold mb-1">
            {resubmit ? "Resubmit for faculty approval" : "Faculty approval required"}
          </p>
          <p className="text-muted-tx text-xs font-fira leading-relaxed">
            Open the Proposal Builder to compose your permission letter, collect council
            signatures, select faculty, and submit.
          </p>
        </div>
      </div>

      <div className="space-y-2 pl-1">
        <StepRow done={hasDoc} label="Permission letter saved" />
        <StepRow done={allSigned} label="Council signatures collected" />
        <StepRow done={facultyOk} label="Faculty reviewers selected" />
      </div>

      <Link
        href={proposalBuilderPath(eventId)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-fira font-semibold bg-red-500 hover:bg-red-600 text-white transition-all"
      >
        <ClipboardList size={15} />
        {ready
          ? resubmit
            ? "Open Proposal Builder & resubmit"
            : "Open Proposal Builder & submit"
          : hasDoc
            ? "Continue in Proposal Builder"
            : "Start Proposal Builder"}
        <ChevronRight size={14} />
      </Link>

      {!ready && hasDoc && (
        <p className="text-[11px] font-fira text-muted-tx text-center">
          Complete signing and faculty selection in the Proposal Builder before submitting.
        </p>
      )}
    </div>
  );
}
