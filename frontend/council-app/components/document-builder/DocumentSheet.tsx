"use client";

import Letterhead from "@/components/document-builder/Letterhead";
import {
  formatDisplayDate,
  type DocumentKind,
  type DocumentSignatory,
  type PermissionLetterFields,
  type ReportFields,
} from "@/lib/document-builder";

interface Props {
  kind: DocumentKind;
  letterheadUrl?: string;
  signatories: DocumentSignatory[];
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
      <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-3">
        {valid.map((s, i) => (
          <div key={`${s.memberId ?? "custom"}-${i}`} className="shrink-0 text-left">
            <p className="font-semibold whitespace-nowrap">{s.name}</p>
            {s.role.trim() && <p className="whitespace-nowrap">{s.role}</p>}
          </div>
        ))}
      </div>
      {councilName && <p className="mt-4">{councilName}</p>}
    </div>
  );
}

function PermissionBody({
  p,
  signatories,
}: {
  p: PermissionLetterFields;
  signatories: DocumentSignatory[];
}) {
  const subject =
    p.subject.trim() ||
    (p.eventName ? `Permission for conducting ${p.eventName}` : "Permission for conducting the event");

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

      {(p.eventName || p.eventDate || p.venue) && (
        <div>
          <p className="font-semibold mb-2">Event details</p>
          <ul className="list-disc pl-5 space-y-1">
            {p.eventName && <li>Name: {p.eventName}</li>}
            {p.eventDate && <li>Date: {formatDisplayDate(p.eventDate)}</li>}
            {p.venue && <li>Venue: {p.venue}</li>}
            {p.councilName && <li>Organized by: {p.councilName}</li>}
          </ul>
        </div>
      )}

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
  letterheadUrl,
  signatories,
  permission,
  report,
  sheetRef,
}: Props) {
  return (
    <article
      ref={sheetRef}
      className="document-sheet mx-auto bg-white text-zinc-900 shadow-xl print:shadow-none"
      style={{ width: "210mm", minHeight: "297mm", padding: "18mm 20mm" }}
    >
      <Letterhead councilLetterheadUrl={letterheadUrl} editable={false} />
      {kind === "permission_letter" ? (
        <PermissionBody p={permission} signatories={signatories} />
      ) : (
        <ReportBody r={report} signatories={signatories} />
      )}
    </article>
  );
}
