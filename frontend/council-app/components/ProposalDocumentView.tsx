"use client";

import { useRef } from "react";
import DocumentSheet from "@/components/document-builder/DocumentSheet";
import type { AssignedFacultyReviewer } from "@/lib/document-builder";
import type { ProposalPackage } from "@/lib/proposal";
import { mergeProposalSignatories } from "@/lib/proposal";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";

export default function ProposalDocumentView({
  proposal,
  compact,
  facultyReviewers,
}: {
  proposal: ProposalPackage;
  compact?: boolean;
  facultyReviewers?: AssignedFacultyReviewer[];
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const doc = mergeProposalSignatories(proposal, facultyReviewers);
  
  const printDocument = useReactToPrint({
    contentRef,
    documentTitle: "Eventio Proposal Letter",
  });

  if (!doc) {
    return (
      <p className="text-muted-tx text-sm font-fira text-center py-8">
        No proposal document has been saved for this event yet.
      </p>
    );
  }

  return (
    <div
      className={`proposal-document-view ${
        compact
          ? "rounded-xl border border-border-c overflow-x-auto bg-zinc-100/80 dark:bg-zinc-900/40 p-3"
          : "rounded-xl border border-border-c overflow-x-auto bg-zinc-100/80 dark:bg-zinc-900/40 p-4 sm:p-6"
      }`}
    >
      {!compact && (
        <div className="flex justify-end mb-3 print:hidden">
          <button
            type="button"
            onClick={() => printDocument()}
            className="flex items-center gap-2 rounded-lg border border-border-c bg-surface px-3 py-2 text-xs font-fira text-muted-tx hover:text-tx"
          >
            <Printer size={14} />
            Print / Save PDF
          </button>
        </div>
      )}
      <div ref={contentRef} className="faculty-print-root">
        <DocumentSheet
          kind={doc.kind}
          permissionTemplate={doc.permissionTemplate}
          letterheadUrl={doc.letterheadUrl}
          signatories={doc.signatories}
          permission={doc.permission}
          report={doc.report}
        />
      </div>
      {proposal.submittedAt && (
        <p className="proposal-document-submitted text-subtle-tx text-xs font-fira mt-3 text-center">
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
