"use client";

import Letterhead from "@/components/document-builder/Letterhead";
import {
  formatDisplayDate,
  type DocumentKind,
  type DocumentSignatory,
  type PermissionLetterFields,
  type PermissionTemplateId,
  type ReportFields,
} from "@/lib/document-builder";

interface Props {
  kind: DocumentKind;
  permissionTemplate?: PermissionTemplateId;
  letterheadUrl?: string;
  signatories: DocumentSignatory[];
  facultySignatures?: Array<{ name: string; png_url: string; role?: string }>;
  permission: PermissionLetterFields;
  report: ReportFields;
  sheetRef?: React.RefObject<HTMLElement | null>;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <p className="text-[13px] font-fira leading-relaxed text-zinc-800 whitespace-pre-wrap">
      <span className="font-semibold">{label}: </span>
      {value}
    </p>
  );
}

function SignatoryBlock({
  signatories,
  councilName,
  closing,
}: {
  signatories: DocumentSignatory[];
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
      <div className="document-signatory-row mt-8 flex flex-wrap items-end gap-x-10 gap-y-3">
        {valid.map((s, i) => (
          <div key={`${s.memberId ?? "custom"}-${i}`} className="shrink-0 text-left min-w-[120px]">
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

function PermissionDetails({
  p,
  template,
}: {
  p: PermissionLetterFields;
  template: PermissionTemplateId;
}) {
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
  }[template];

  return (
    <div>
      <p className="font-semibold mb-2">{sectionTitle}</p>
      <ul className="list-disc pl-5 space-y-1">
        {p.eventName && <li>Event: {p.eventName}</li>}
        {p.eventDate && <li>Date: {formatDisplayDate(p.eventDate)}</li>}
        {p.venue && (template === "event" || template === "venue" || template === "custom") && (
          <li>Venue: {p.venue}</li>
        )}
        {(template === "banner" || template === "custom") && p.bannerLocation && (
          <li>Display location(s): {p.bannerLocation}</li>
        )}
        {(template === "pr" || template === "custom") && p.publicityChannels && (
          <li>Channels: {p.publicityChannels}</li>
        )}
        {p.councilName && <li>Organized by: {p.councilName}</li>}
      </ul>
    </div>
  );
}

function PermissionBody({
  p,
  signatories,
  template,
}: {
  p: PermissionLetterFields;
  signatories: DocumentSignatory[];
  template: PermissionTemplateId;
}) {
  const subject =
    p.subject.trim() ||
    (template === "custom"
      ? ""
      : p.eventName
        ? `Permission for conducting ${p.eventName}`
        : "Permission for conducting the event");

  return (
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
  );
}

function ReportBody({
  r,
  signatories,
}: {
  r: ReportFields;
  signatories: DocumentSignatory[];
}) {
  return (
    <div className="space-y-5 text-[13px] font-fira text-zinc-800 leading-relaxed">
      <div className="text-center space-y-1 pb-2 border-b border-zinc-200">
        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Post-Event Report</p>
        <h1 className="text-lg font-marcellus text-zinc-900">{r.eventName || "Event Report"}</h1>
        <p className="text-[12px] text-zinc-600">Submitted on {formatDisplayDate(r.date)}</p>
      </div>

      <MetaRow label="Event date" value={r.eventDate ? formatDisplayDate(r.eventDate) : ""} />
      <MetaRow label="Venue" value={r.venue} />
      <MetaRow label="Attendance" value={r.attendance} />

      {r.summary && (
        <section>
          <h2 className="text-sm font-semibold mb-1.5">Executive summary</h2>
          <p className="whitespace-pre-wrap">{r.summary}</p>
        </section>
      )}

      {r.highlights && (
        <section>
          <h2 className="text-sm font-semibold mb-1.5">Highlights</h2>
          <p className="whitespace-pre-wrap">{r.highlights}</p>
        </section>
      )}

      {r.outcomes && (
        <section>
          <h2 className="text-sm font-semibold mb-1.5">Outcomes &amp; feedback</h2>
          <p className="whitespace-pre-wrap">{r.outcomes}</p>
        </section>
      )}

      {r.conclusion && (
        <section>
          <h2 className="text-sm font-semibold mb-1.5">Conclusion</h2>
          <p className="whitespace-pre-wrap">{r.conclusion}</p>
        </section>
      )}

      <SignatoryBlock signatories={signatories} councilName={r.councilName} />
    </div>
  );
}

export default function DocumentSheet({
  kind,
  permissionTemplate = "event",
  letterheadUrl,
  signatories,
  facultySignatures = [],
  permission,
  report,
  sheetRef,
}: Props) {
  return (
    <article
      ref={sheetRef}
      className="document-sheet mx-auto w-full max-w-[210mm] bg-white text-zinc-900 shadow-xl print:shadow-none"
    >
      <Letterhead councilLetterheadUrl={letterheadUrl} />
      {kind === "permission_letter" ? (
        <PermissionBody p={permission} signatories={signatories} template={permissionTemplate} />
      ) : (
        <ReportBody r={report} signatories={signatories} />
      )}

      {facultySignatures.length > 0 && (
        <div className="mt-10 pt-6 border-t border-zinc-200">
          <p className="text-[12px] font-semibold font-fira text-zinc-700 mb-3 uppercase tracking-wide">
            Faculty approval
          </p>
          <div className="document-signatory-row flex flex-wrap items-end gap-x-10 gap-y-3">
            {facultySignatures.map((s, i) => (
              <div key={`${s.name}-${i}`} className="shrink-0 text-left min-w-[120px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.png_url} alt="" className="h-12 max-w-[140px] object-contain mb-1" />
                <p className="font-semibold text-[13px]">{s.name}</p>
                {s.role && <p className="text-[12px] text-zinc-700">{s.role}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
