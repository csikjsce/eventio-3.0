"use client";

import type { ProposalPackage, AssignedFacultyReviewer } from "@/lib/proposal";
import { mergeProposalSignatories } from "@/lib/proposal";

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProposalDocumentView({
  proposal,
  facultyReviewers,
}: {
  proposal: ProposalPackage;
  facultyReviewers?: AssignedFacultyReviewer[];
}) {
  const doc = mergeProposalSignatories(proposal, facultyReviewers);

  if (!doc) {
    return (
      <p className="text-muted-foreground text-sm text-center py-8">
        No proposal document attached to this event.
      </p>
    );
  }

  const p = doc.permission;
  const signatories = doc.signatories.filter((s) => s.name.trim());

  return (
    <div className="rounded-xl border border-border bg-white text-zinc-900 p-6 sm:p-8 text-sm leading-relaxed overflow-x-auto">
      {doc.letterheadUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={doc.letterheadUrl} alt="" className="h-14 object-contain mb-6" />
      )}

      <div className="flex flex-wrap justify-between gap-4 text-xs mb-4">
        {p.refNo && <p><span className="font-semibold">Ref:</span> {p.refNo}</p>}
        <p><span className="font-semibold">Date:</span> {formatDate(p.date)}</p>
      </div>

      <div className="mb-4">
        <p className="font-semibold mb-1">To,</p>
        <p className="whitespace-pre-wrap">{p.recipient}</p>
      </div>

      <p className="mb-4">
        <span className="font-semibold">Subject: </span>
        {p.subject || `Permission for conducting ${p.eventName || "the event"}`}
      </p>

      <p className="whitespace-pre-wrap mb-6">{p.body}</p>

      <div className="mt-8">
        <p className="mb-2">Thanking you,</p>
        <div className="flex flex-wrap items-end gap-x-10 gap-y-4 mt-6">
          {signatories.map((s, i) => (
            <div key={`${s.email ?? s.memberId ?? i}`} className="min-w-[120px]">
              {s.signatureUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={s.signatureUrl} alt="" className="h-12 object-contain mb-1" />
              ) : (
                <div className="h-12 border-b border-zinc-400 mb-1" />
              )}
              <p className="font-semibold">{s.name}</p>
              {s.role && <p className="text-zinc-600 text-xs">{s.role}</p>}
            </div>
          ))}
        </div>
        {p.councilName && <p className="mt-4">{p.councilName}</p>}
      </div>
    </div>
  );
}
