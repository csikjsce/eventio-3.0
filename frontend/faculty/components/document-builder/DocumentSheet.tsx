"use client";

import Letterhead from "@/components/document-builder/Letterhead";
import type { ProposalDocumentState } from "@/lib/proposal";

interface Props {
  doc: ProposalDocumentState;
}

function formatDisplayDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function SignatoryBlock({
  signatories,
  councilName,
  closing,
}: {
  signatories: ProposalDocumentState["signatories"];
  councilName: string;
  closing?: string;
}) {
  const valid = signatories.filter((s) => s.name.trim());
  if (valid.length === 0) {
    return (
      <div className="pt-6">
        {closing && <p>{closing}</p>}
        <p className="mt-8 font-semibold">—</p>
        {councilName && <p className="mt-2">{councilName}</p>}
      </div>
    );
  }

  return (
    <div className="pt-6">
      {closing && <p>{closing}</p>}
      <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-3">
        {valid.map((s, i) => (
          <div key={`${s.memberId ?? s.email ?? "custom"}-${i}`} className="shrink-0 text-left min-w-[120px]">
            {s.signatureUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={s.signatureUrl}
                alt={`Signature of ${s.name}`}
                className="h-12 max-w-[140px] object-contain mb-1"
              />
            ) : (
              <div className="h-12 mb-1 border-b border-zinc-400" />
            )}
            <p className="font-semibold whitespace-nowrap text-[13px]">{s.name}</p>
            {s.role.trim() && (
              <p className="whitespace-nowrap text-[12px] text-zinc-700">{s.role}</p>
            )}
          </div>
        ))}
      </div>
      {councilName && <p className="mt-4">{councilName}</p>}
    </div>
  );
}

function PermissionDetails({ p, template }: { p: ProposalDocumentState["permission"]; template: string }) {
  const hasContent =
    p.eventName ||
    p.eventDate ||
    p.venue ||
    p.bannerLocation ||
    p.publicityChannels ||
    p.councilName;

  if (!hasContent) return null;

  const sectionTitle = {
    event: "Event details",
    venue: "Venue details",
    banner: "Banner details",
    pr: "Publicity details",
    custom: "Additional details",
  }[template] ?? "Additional details";

  return (
    <div>
      <p className="font-semibold mb-2">{sectionTitle}</p>
      <ul className="list-disc pl-5 space-y-1">
        {p.eventName && <li>Event: {p.eventName}</li>}
        {p.eventDate && <li>Date: {formatDisplayDate(p.eventDate)}</li>}
        {p.venue && (["event", "venue", "custom"].includes(template)) && <li>Venue: {p.venue}</li>}
        {(["banner", "custom"].includes(template)) && p.bannerLocation && <li>Display location(s): {p.bannerLocation}</li>}
        {(["pr", "custom"].includes(template)) && p.publicityChannels && <li>Channels: {p.publicityChannels}</li>}
        {p.councilName && <li>Organized by: {p.councilName}</li>}
      </ul>
    </div>
  );
}

export default function DocumentSheet({ doc }: Props) {
  const p = doc.permission;
  const signatories = doc.signatories;
  const template = doc.permissionTemplate ?? "event";
  const subject =
    p.subject.trim() ||
    (template === "custom"
      ? ""
      : p.eventName
        ? `Permission for conducting ${p.eventName}`
        : "Permission for conducting the event");

  return (
    <article
      className="document-sheet mx-auto w-full max-w-[210mm] bg-white text-zinc-900 shadow-xl print:shadow-none"
      style={{ minHeight: "297mm", padding: "18mm 20mm" }}
    >
      <Letterhead councilLetterheadUrl={doc.letterheadUrl} />

      <div className="space-y-4 text-[13px] font-fira text-zinc-800 leading-relaxed">
        <div className="flex flex-wrap justify-between gap-4 text-[12px]">
          {p.refNo && <p><span className="font-semibold">Ref:</span> {p.refNo}</p>}
          <p><span className="font-semibold">Date:</span> {formatDisplayDate(p.date)}</p>
        </div>

        <div>
          <p className="font-semibold mb-1">To,</p>
          <p className="whitespace-pre-wrap">{p.recipient}</p>
        </div>

        <p>
          <span className="font-semibold">Subject: </span>
          {subject}
        </p>

        <p className="whitespace-pre-wrap">{p.body}</p>

        <PermissionDetails p={p} template={template} />

        <SignatoryBlock
          signatories={signatories}
          councilName={p.councilName}
          closing="Thanking you,"
        />
      </div>
    </article>
  );
}
