"use client";

import DocumentSheet from "@/components/document-builder/DocumentSheet";
import type { AssignedFacultyReviewer } from "@/lib/document-builder";
import type { ProposalPackage } from "@/lib/proposal";
import { mergeProposalSignatories } from "@/lib/proposal";

export default function ProposalDocumentView({
  proposal,
  compact,
  facultyReviewers,
}: {
  proposal: ProposalPackage;
  compact?: boolean;
  facultyReviewers?: AssignedFacultyReviewer[];
}) {
  const doc = mergeProposalSignatories(proposal, facultyReviewers);

  if (!doc) {
    return (
      <p className="text-muted-tx text-sm font-fira text-center py-8">
        No proposal document has been saved for this event yet.
      </p>
    );
  }

  return (
    <div
      className={
        compact
          ? "rounded-xl border border-border-c overflow-x-auto bg-zinc-100/80 dark:bg-zinc-900/40 p-3"
          : "rounded-xl border border-border-c overflow-x-auto bg-zinc-100/80 dark:bg-zinc-900/40 p-4 sm:p-6"
      }
    >
      <DocumentSheet
        kind={doc.kind}
        permissionTemplate={doc.permissionTemplate}
        letterheadUrl={doc.letterheadUrl}
        signatories={doc.signatories}
        permission={doc.permission}
        report={doc.report}
      />
      {proposal.submittedAt && (
        <p className="text-subtle-tx text-xs font-fira mt-3 text-center">
          Submitted to faculty on{" "}
          {new Date(proposal.submittedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
