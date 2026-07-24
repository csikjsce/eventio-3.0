"use client";

import { useRef } from "react";
import DocumentSheet from "@/components/document-builder/DocumentSheet";
import type { ProposalPackage, AssignedFacultyReviewer } from "@/lib/proposal";
import { mergeProposalSignatories } from "@/lib/proposal";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";

export default function ProposalDocumentView({
  proposal,
  facultyReviewers,
}: {
  proposal: ProposalPackage;
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
      <p className="text-muted-foreground text-sm text-center py-8">
        No proposal document attached to this event.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-x-auto bg-zinc-100/80 dark:bg-zinc-900/40 p-4 sm:p-6">
      <div className="flex justify-end mb-3 print:hidden">
        <button
          type="button"
          onClick={() => printDocument()}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Printer size={14} />
          Print / Save PDF
        </button>
      </div>
      <div ref={contentRef} className="faculty-print-root">
        <DocumentSheet doc={doc} />
      </div>
    </div>
  );
}
