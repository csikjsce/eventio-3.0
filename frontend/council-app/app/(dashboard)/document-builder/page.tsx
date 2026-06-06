"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, Printer, Upload } from "lucide-react";
import DocumentSheet from "@/components/document-builder/DocumentSheet";
import Letterhead from "@/components/document-builder/Letterhead";
import { useData } from "@/contexts/DataContext";
import {
  buildDefaultState,
  loadDraft,
  saveDraft,
  type DocumentBuilderState,
  type DocumentKind,
} from "@/lib/document-builder";
import { fetchCouncilProfile, updateCouncilProfile } from "@/lib/api";
import { uploadFile } from "@/lib/upload";

const INPUT =
  "w-full bg-surface border border-border-c rounded-lg px-3 py-2 text-sm font-fira text-tx outline-none focus:border-red-500/40 placeholder-subtle-tx";
const LABEL = "block text-subtle-tx text-[11px] font-fira uppercase tracking-wide mb-1";

function Field({
  label,
  value,
  onChange,
  multiline,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={`${INPUT} resize-y min-h-[80px]`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT}
        />
      )}
    </div>
  );
}

export default function DocumentBuilderPage() {
  const { events } = useData();
  const sheetRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<DocumentBuilderState>(() => buildDefaultState());
  const [uploadingHead, setUploadingHead] = useState(false);
  const [savingHead, setSavingHead] = useState(false);
  const [attachEventId, setAttachEventId] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    const draft = loadDraft();
    if (draft) setState(draft);

    fetchCouncilProfile()
      .then((profile) => {
        const councilName = profile.name ?? "";
        const letterhead = profile.profile?.banner_url ?? "";
        setState((prev) => ({
          ...prev,
          letterheadUrl: prev.letterheadUrl || letterhead,
          permission: {
            ...prev.permission,
            councilName: prev.permission.councilName || councilName,
          },
          report: {
            ...prev.report,
            councilName: prev.report.councilName || councilName,
          },
        }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    saveDraft(state);
  }, [state]);

  const setKind = (kind: DocumentKind) => setState((s) => ({ ...s, kind }));

  const applyEvent = useCallback(
    (eventId: string) => {
      setState((s) => ({ ...s, eventId }));
      const event = events.find((e) => String(e.id) === eventId);
      if (!event) return;

      const eventDate = event.dates?.[0]?.slice(0, 10) ?? "";
      setState((s) => ({
        ...s,
        eventId,
        permission: {
          ...s.permission,
          eventName: event.name,
          eventDate,
          venue: event.venue ?? "",
          subject: s.permission.subject || `Permission for conducting ${event.name}`,
        },
        report: {
          ...s.report,
          eventName: event.name,
          eventDate,
          venue: event.venue ?? "",
          attendance: event.tickets_sold
            ? `${event.tickets_sold} participants registered`
            : s.report.attendance,
        },
      }));
    },
    [events],
  );

  async function handleLetterheadUpload(file: File) {
    setUploadingHead(true);
    try {
      const url = await uploadFile(file, "eventio-council-images");
      setState((s) => ({ ...s, letterheadUrl: url }));
      showToast("Letterhead uploaded.");
    } catch {
      showToast("Letterhead upload failed.");
    } finally {
      setUploadingHead(false);
    }
  }

  async function persistLetterheadToProfile() {
    if (!state.letterheadUrl) return;
    setSavingHead(true);
    try {
      await updateCouncilProfile({ banner_url: state.letterheadUrl });
      showToast("Letterhead saved to council profile.");
    } catch {
      showToast("Could not save letterhead to profile.");
    } finally {
      setSavingHead(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const p = state.permission;
  const r = state.report;

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-[1600px] mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-surface border border-border-c shadow-xl rounded-xl px-4 py-3 text-tx text-sm font-fira">
          {toast}
        </div>
      )}

      {/* Header — hidden when printing */}
      <div className="document-builder-chrome flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-tx text-2xl font-marcellus flex items-center gap-2">
            <FileText size={22} className="text-red-500" />
            Document Builder
          </h1>
          <p className="text-muted-tx text-sm font-fira mt-1">
            Compose permission letters and post-event reports on official letterhead.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-fira font-medium"
          >
            <Printer size={15} /> Print / Save PDF
          </button>
          {attachEventId && (
            <Link
              href={`/event-details/${attachEventId}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-c bg-surface hover:border-red-500/30 text-tx text-sm font-fira"
            >
              <ExternalLink size={15} /> Upload in event details
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-8 items-start">
        {/* Editor panel */}
        <aside className="document-builder-chrome space-y-5">
          <div className="bg-surface border border-border-c rounded-2xl p-5 space-y-4">
            <div>
              <p className={LABEL}>Document type</p>
              <div className="flex gap-2">
                {(
                  [
                    ["permission_letter", "Permission letter"],
                    ["report", "Report"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setKind(id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-fira font-medium border transition-all ${
                      state.kind === id
                        ? "bg-red-500/10 border-red-500/30 text-red-500"
                        : "border-border-c text-muted-tx hover:text-tx"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={LABEL}>Prefill from event</label>
              <select
                value={state.eventId}
                onChange={(e) => applyEvent(e.target.value)}
                className={INPUT}
              >
                <option value="">— Select event —</option>
                {events.map((e) => (
                  <option key={e.id} value={String(e.id)}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Letterhead upload */}
          <div className="bg-surface border border-border-c rounded-2xl p-5 space-y-3">
            <p className="text-tx text-sm font-fira font-semibold">Letterhead</p>
            <p className="text-muted-tx text-xs font-fira leading-relaxed">
              Eventio and Somaiya logos are fixed. Upload your council banner in the centre.
            </p>
            <Letterhead
              councilLetterheadUrl={state.letterheadUrl}
              onUpload={handleLetterheadUpload}
              uploading={uploadingHead}
              editable
            />
            {state.letterheadUrl && (
              <button
                type="button"
                disabled={savingHead}
                onClick={persistLetterheadToProfile}
                className="flex items-center gap-2 text-xs font-fira text-red-500 hover:underline disabled:opacity-50"
              >
                <Upload size={12} />
                {savingHead ? "Saving…" : "Save letterhead to council settings"}
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="bg-surface border border-border-c rounded-2xl p-5 space-y-4 max-h-[55vh] overflow-y-auto scrollbar-hide">
            {state.kind === "permission_letter" ? (
              <>
                <Field label="Reference no." value={p.refNo} onChange={(v) => setState((s) => ({ ...s, permission: { ...s.permission, refNo: v } }))} />
                <Field label="Date" value={p.date} onChange={(v) => setState((s) => ({ ...s, permission: { ...s.permission, date: v } }))} />
                <Field label="To" value={p.recipient} onChange={(v) => setState((s) => ({ ...s, permission: { ...s.permission, recipient: v } }))} multiline rows={5} />
                <Field label="Subject" value={p.subject} onChange={(v) => setState((s) => ({ ...s, permission: { ...s.permission, subject: v } }))} />
                <Field label="Body" value={p.body} onChange={(v) => setState((s) => ({ ...s, permission: { ...s.permission, body: v } }))} multiline rows={6} />
                <Field label="Event name" value={p.eventName} onChange={(v) => setState((s) => ({ ...s, permission: { ...s.permission, eventName: v } }))} />
                <Field label="Event date" value={p.eventDate} onChange={(v) => setState((s) => ({ ...s, permission: { ...s.permission, eventDate: v } }))} />
                <Field label="Venue" value={p.venue} onChange={(v) => setState((s) => ({ ...s, permission: { ...s.permission, venue: v } }))} />
                <Field label="Signatory name" value={p.signatoryName} onChange={(v) => setState((s) => ({ ...s, permission: { ...s.permission, signatoryName: v } }))} />
                <Field label="Signatory role" value={p.signatoryRole} onChange={(v) => setState((s) => ({ ...s, permission: { ...s.permission, signatoryRole: v } }))} />
                <Field label="Council name" value={p.councilName} onChange={(v) => setState((s) => ({ ...s, permission: { ...s.permission, councilName: v } }))} />
              </>
            ) : (
              <>
                <Field label="Report date" value={r.date} onChange={(v) => setState((s) => ({ ...s, report: { ...s.report, date: v } }))} />
                <Field label="Event name" value={r.eventName} onChange={(v) => setState((s) => ({ ...s, report: { ...s.report, eventName: v } }))} />
                <Field label="Event date" value={r.eventDate} onChange={(v) => setState((s) => ({ ...s, report: { ...s.report, eventDate: v } }))} />
                <Field label="Venue" value={r.venue} onChange={(v) => setState((s) => ({ ...s, report: { ...s.report, venue: v } }))} />
                <Field label="Attendance" value={r.attendance} onChange={(v) => setState((s) => ({ ...s, report: { ...s.report, attendance: v } }))} />
                <Field label="Executive summary" value={r.summary} onChange={(v) => setState((s) => ({ ...s, report: { ...s.report, summary: v } }))} multiline rows={4} />
                <Field label="Highlights" value={r.highlights} onChange={(v) => setState((s) => ({ ...s, report: { ...s.report, highlights: v } }))} multiline rows={4} />
                <Field label="Outcomes & feedback" value={r.outcomes} onChange={(v) => setState((s) => ({ ...s, report: { ...s.report, outcomes: v } }))} multiline rows={4} />
                <Field label="Conclusion" value={r.conclusion} onChange={(v) => setState((s) => ({ ...s, report: { ...s.report, conclusion: v } }))} multiline rows={3} />
                <Field label="Submitted by" value={r.submittedBy} onChange={(v) => setState((s) => ({ ...s, report: { ...s.report, submittedBy: v } }))} />
                <Field label="Council name" value={r.councilName} onChange={(v) => setState((s) => ({ ...s, report: { ...s.report, councilName: v } }))} />
              </>
            )}
          </div>

          <div>
            <label className={LABEL}>Attach to event (optional)</label>
            <select
              value={attachEventId}
              onChange={(e) => setAttachEventId(e.target.value)}
              className={INPUT}
            >
              <option value="">— None —</option>
              {events.map((e) => (
                <option key={e.id} value={String(e.id)}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Preview */}
        <div className="document-builder-preview bg-zinc-200/80 dark:bg-zinc-900/50 rounded-2xl p-4 sm:p-8 overflow-x-auto">
          <DocumentSheet
            sheetRef={sheetRef}
            kind={state.kind}
            letterheadUrl={state.letterheadUrl}
            permission={p}
            report={r}
          />
        </div>
      </div>
    </div>
  );
}
