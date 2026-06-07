"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Printer, RotateCcw, Upload } from "lucide-react";
import DocumentSheet from "@/components/document-builder/DocumentSheet";
import CouncilSignatorySigning from "@/components/document-builder/CouncilSignatorySigning";
import Letterhead from "@/components/document-builder/Letterhead";
import { useData } from "@/contexts/DataContext";
import {
  fetchCouncilProfile,
  updateCouncilProfile,
  type CouncilMemberRow,
} from "@/lib/api";
import { dataUrlToFile } from "@/lib/proposal";
import { proposalBuilderPath } from "@/lib/proposal-routes";
import {
  applyPermissionTemplate,
  buildDefaultState,
  clearDraft,
  loadDraft,
  PERMISSION_TEMPLATES,
  resolveLetterheadUrl,
  saveDraft,
  type DocumentBuilderState,
  type DocumentKind,
  type DocumentSignatory,
  type PermissionTemplateId,
} from "@/lib/document-builder";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { events } = useData();
  const sheetRef = useRef<HTMLElement>(null);
  const profileLetterheadRef = useRef("");
  const [state, setState] = useState<DocumentBuilderState>(() => buildDefaultState());
  const [uploadingHead, setUploadingHead] = useState(false);
  const [savingHead, setSavingHead] = useState(false);
  const [members, setMembers] = useState<CouncilMemberRow[]>([]);
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
        const p = profile.profile ?? {};
        profileLetterheadRef.current = resolveLetterheadUrl(
          p.letterhead_logo,
          profile.photo_url,
          p.banner_url,
        );
        setState((prev) => ({
          ...prev,
          letterheadUrl: resolveLetterheadUrl(
            p.letterhead_logo,
            profile.photo_url,
            p.banner_url,
            prev.letterheadUrl,
          ),
          permission: {
            ...prev.permission,
            councilName: prev.permission.councilName || councilName,
          },
          report: {
            ...prev.report,
            councilName: prev.report.councilName || councilName,
          },
        }));

        if (Array.isArray(profile.profile?.members)) {
          setMembers(profile.profile.members);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const param = searchParams.get("eventId");
    if (param) {
      router.replace(proposalBuilderPath(param));
    }
  }, [searchParams, router]);

  useEffect(() => {
    saveDraft(state);
  }, [state]);

  const setKind = (kind: DocumentKind) => setState((s) => ({ ...s, kind }));

  function selectPermissionTemplate(templateId: PermissionTemplateId) {
    setState((s) => ({
      ...s,
      kind: "permission_letter",
      permissionTemplate: templateId,
      permission: applyPermissionTemplate(templateId, s.permission),
    }));
    const label = PERMISSION_TEMPLATES.find((t) => t.id === templateId)?.label ?? "Template";
    showToast(
      templateId === "custom"
        ? "Custom letter — edit subject and body freely."
        : `${label} template applied.`,
    );
  }

  const applyEvent = useCallback(
    (eventId: string, preselectHeads = false) => {
      setState((s) => ({ ...s, eventId }));
      const event = events.find((e) => String(e.id) === eventId);
      if (!event) return;

      const eventDate = event.dates?.[0]?.slice(0, 10) ?? "";
      setState((s) => {
        const permission = {
          ...s.permission,
          eventName: event.name,
          eventDate,
          venue: event.venue ?? "",
        };
        const next: DocumentBuilderState = {
          ...s,
          eventId,
          permission:
            s.permissionTemplate === "custom"
              ? permission
              : applyPermissionTemplate(s.permissionTemplate, permission),
          report: {
            ...s.report,
            eventName: event.name,
            eventDate,
            venue: event.venue ?? "",
            attendance: event.tickets_sold
              ? `${event.tickets_sold} participants registered`
              : s.report.attendance,
          },
        };

        if (preselectHeads && next.signatories.length === 0) {
          const heads = members.filter((m) => m.is_head);
          if (heads.length > 0) {
            next.signatories = heads.map((m) => ({
              memberId: m.id,
              name: m.name,
              role: m.role,
            }));
          }
        }
        return next;
      });
    },
    [events, members],
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
      await updateCouncilProfile({ letterhead_logo: state.letterheadUrl });
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

  function clearAll() {
    if (
      !window.confirm(
        "Clear this document and start fresh? All fields, signatories, and event prefill will be reset.",
      )
    ) {
      return;
    }

    clearDraft();
    const councilName = state.permission.councilName || state.report.councilName || "";
    const fresh = buildDefaultState(councilName);
    fresh.letterheadUrl = profileLetterheadRef.current;
    fresh.permission = applyPermissionTemplate("event", fresh.permission);
    setState(fresh);
    showToast("Document cleared — start fresh.");
  }

  function isSignatorySelected(memberId: number) {
    return state.signatories.some((s) => s.memberId === memberId);
  }

  function toggleMemberSignatory(member: CouncilMemberRow) {
    setState((s) => {
      const selected = s.signatories.some((sig) => sig.memberId === member.id);
      const signatories = selected
        ? s.signatories.filter((sig) => sig.memberId !== member.id)
        : [
            ...s.signatories,
            { memberId: member.id, name: member.name, role: member.role },
          ];
      return { ...s, signatories };
    });
  }

  function addCustomSignatory() {
    setState((s) => ({
      ...s,
      signatories: [...s.signatories, { name: "", role: "" }],
    }));
  }

  function updateCustomSignatory(index: number, patch: Partial<DocumentSignatory>) {
    setState((s) => ({
      ...s,
      signatories: s.signatories.map((sig, i) => (i === index ? { ...sig, ...patch } : sig)),
    }));
  }

  function removeSignatory(index: number) {
    setState((s) => ({
      ...s,
      signatories: s.signatories.filter((_, i) => i !== index),
    }));
  }

  async function handleSignCouncilMember(index: number, dataUrl: string) {
    const sig = state.signatories[index];
    const file = dataUrlToFile(
      dataUrl,
      `council-sig-${sig.memberId ?? index}.png`,
    );
    const url = await uploadFile(file, "eventio-council-images");
    setState((s) => ({
      ...s,
      signatories: s.signatories.map((x, i) =>
        i === index
          ? { ...x, signatureUrl: url, signedAt: new Date().toISOString() }
          : x,
      ),
    }));
    showToast(`${sig.name} signed.`);
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
            Compose permission letters and post-event reports on official letterhead. For faculty
            approval proposals, use{" "}
            <Link href="/approvals" className="text-red-500 hover:underline">
              Approvals
            </Link>{" "}
            or open Proposal Builder from an event.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-c bg-surface hover:border-red-500/30 text-muted-tx hover:text-tx text-sm font-fira"
          >
            <RotateCcw size={15} /> Clear all
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-fira font-medium"
          >
            <Printer size={15} /> Print / Save PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-8 items-start min-w-0">
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

            {state.kind === "permission_letter" && (
              <div>
                <p className={LABEL}>Permission template</p>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSION_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => selectPermissionTemplate(tpl.id)}
                      className={`text-left py-2.5 px-3 rounded-lg border transition-all ${
                        state.permissionTemplate === tpl.id
                          ? "bg-red-500/10 border-red-500/30 text-red-500"
                          : "border-border-c text-muted-tx hover:text-tx hover:border-red-500/20"
                      }`}
                    >
                      <span className="block text-xs font-fira font-semibold">{tpl.label}</span>
                      <span className="block text-[10px] font-fira mt-0.5 opacity-80 leading-snug">
                        {tpl.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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

          {/* Letterhead */}
          <div className="bg-surface border border-border-c rounded-2xl p-5 space-y-3">
            <p className="text-tx text-sm font-fira font-semibold">Letterhead</p>
            <p className="text-muted-tx text-xs font-fira leading-relaxed">
              The header on printed letters: Eventio and Somaiya logos are fixed. Your council logo appears on the
              right — upload or replace it below. Manage the default in{" "}
              <Link href="/settings" className="text-red-500 hover:underline">Settings → Letterhead Logo</Link>.
            </p>
            <Letterhead
              variant="compact"
              councilLetterheadUrl={state.letterheadUrl}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-c bg-surface2 hover:border-red-500/30 text-xs font-fira text-tx cursor-pointer">
                <Upload size={13} className="text-red-500" />
                {uploadingHead ? "Uploading…" : state.letterheadUrl ? "Replace logo" : "Upload logo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingHead}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLetterheadUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {state.letterheadUrl && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setState((s) => ({ ...s, letterheadUrl: "" }));
                      showToast("Council logo removed from this document.");
                    }}
                    className="px-3 py-1.5 rounded-lg border border-border-c text-xs font-fira text-muted-tx hover:text-red-500 hover:border-red-500/30"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    disabled={savingHead}
                    onClick={persistLetterheadToProfile}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-fira text-red-500 hover:underline disabled:opacity-50"
                  >
                    {savingHead ? "Saving…" : "Save as default in settings"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Signatories */}
          <div className="bg-surface border border-border-c rounded-2xl p-5 space-y-3">
            <p className="text-tx text-sm font-fira font-semibold">Signatories</p>
            <p className="text-muted-tx text-xs font-fira leading-relaxed">
              Select one or more council members. Names appear in a single row on the printed document.
            </p>

            {members.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-hide">
                {members.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-surface2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSignatorySelected(member.id)}
                      onChange={() => toggleMemberSignatory(member)}
                      className="rounded border-border-c text-red-500 focus:ring-red-500/30"
                    />
                    <span className="text-sm font-fira text-tx truncate">{member.name}</span>
                    <span className="text-[11px] font-fira text-muted-tx truncate ml-auto">{member.role}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-muted-tx text-xs font-fira">
                No team members found. Add members in{" "}
                <Link href="/settings" className="text-red-500 hover:underline">Settings</Link>.
              </p>
            )}

            {state.signatories.some((s) => s.memberId === undefined) && (
              <div className="space-y-2 pt-2 border-t border-border-c">
                {state.signatories.map((sig, index) =>
                  sig.memberId !== undefined ? null : (
                    <div key={`custom-${index}`} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={sig.name}
                          onChange={(e) => updateCustomSignatory(index, { name: e.target.value })}
                          placeholder="Name"
                          className={INPUT}
                        />
                        <input
                          type="text"
                          value={sig.role}
                          onChange={(e) => updateCustomSignatory(index, { role: e.target.value })}
                          placeholder="Role"
                          className={INPUT}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSignatory(index)}
                        className="text-muted-tx hover:text-red-500 text-xs font-fira px-1 pt-2"
                      >
                        Remove
                      </button>
                    </div>
                  ),
                )}
              </div>
            )}

            <button
              type="button"
              onClick={addCustomSignatory}
              className="text-xs font-fira text-red-500 hover:underline"
            >
              + Add custom signatory
            </button>
          </div>

          {state.signatories.some((s) => s.name.trim()) && (
            <CouncilSignatorySigning
              signatories={state.signatories}
              onSign={handleSignCouncilMember}
            />
          )}

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
                {(state.permissionTemplate === "event" ||
                  state.permissionTemplate === "venue" ||
                  state.permissionTemplate === "custom") && (
                  <Field label="Venue" value={p.venue} onChange={(v) => setState((s) => ({ ...s, permission: { ...s.permission, venue: v } }))} />
                )}
                {(state.permissionTemplate === "banner" || state.permissionTemplate === "custom") && (
                  <Field
                    label="Banner location(s)"
                    value={p.bannerLocation}
                    onChange={(v) => setState((s) => ({ ...s, permission: { ...s.permission, bannerLocation: v } }))}
                    multiline
                    rows={3}
                  />
                )}
                {(state.permissionTemplate === "pr" || state.permissionTemplate === "custom") && (
                  <Field
                    label="Publicity channels"
                    value={p.publicityChannels}
                    onChange={(v) => setState((s) => ({ ...s, permission: { ...s.permission, publicityChannels: v } }))}
                    multiline
                    rows={3}
                  />
                )}
                <Field label="Council name" value={p.councilName} onChange={(v) => setState((s) => ({ ...s, permission: { ...s.permission, councilName: v } }))} />
                {state.permissionTemplate !== "custom" && (
                <button
                  type="button"
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      permission: applyPermissionTemplate(s.permissionTemplate, s.permission),
                    }))
                  }
                  className="text-xs font-fira text-red-500 hover:underline"
                >
                  Reset subject &amp; body from template
                </button>
                )}
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
                <Field label="Council name" value={r.councilName} onChange={(v) => setState((s) => ({ ...s, report: { ...s.report, councilName: v } }))} />
              </>
            )}
          </div>
        </aside>

        {/* Preview */}
        <div className="document-builder-preview min-w-0 bg-zinc-200/80 dark:bg-zinc-900/50 rounded-2xl p-4 sm:p-8 overflow-x-hidden overflow-y-auto">
          <DocumentSheet
            sheetRef={sheetRef}
            kind={state.kind}
            permissionTemplate={state.permissionTemplate}
            letterheadUrl={state.letterheadUrl}
            signatories={state.signatories}
            permission={state.permission}
            report={state.report}
          />
        </div>
      </div>
    </div>
  );
}
