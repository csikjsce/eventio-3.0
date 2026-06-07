"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ClipboardList,
  Loader2,
  Printer,
  Save,
  Send,
  Upload,
} from "lucide-react";
import DocumentSheet from "@/components/document-builder/DocumentSheet";
import CouncilSignatorySigning from "@/components/document-builder/CouncilSignatorySigning";
import FacultyReviewerSelect from "@/components/FacultyReviewerSelect";
import Letterhead from "@/components/document-builder/Letterhead";
import BuilderField, { LABEL } from "@/components/proposal-builder/BuilderField";
import { useData } from "@/contexts/DataContext";
import {
  fetchCouncilProfile,
  type CouncilMemberRow,
  type FacultyAdvisorRow,
} from "@/lib/api";
import {
  applyPermissionTemplate,
  applyFacultyReviewersToDocument,
  PERMISSION_TEMPLATES,
  resolveFacultyReviewers,
  resolveLetterheadUrl,
  type DocumentBuilderState,
  type PermissionTemplateId,
} from "@/lib/document-builder";
import {
  allCouncilSigned,
  councilSignaturesFromDocument,
  dataUrlToFile,
  fetchProposal,
  mergeCouncilSignatures,
  saveProposal,
  submitProposal,
} from "@/lib/proposal";
import { uploadFile } from "@/lib/upload";

function StepRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-fira">
      {done ? (
        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
      ) : (
        <Circle size={14} className="text-muted-tx shrink-0" />
      )}
      <span className={done ? "text-tx" : "text-muted-tx"}>{label}</span>
    </div>
  );
}

export default function ProposalBuilder({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { events, refreshEvents } = useData();
  const sheetRef = useRef<HTMLElement>(null);
  const profileLetterheadRef = useRef("");

  const event = events.find((e) => String(e.id) === eventId);

  const [state, setState] = useState<DocumentBuilderState | null>(null);
  const [eventState, setEventState] = useState<string | null>(null);
  const [members, setMembers] = useState<CouncilMemberRow[]>([]);
  const [advisors, setAdvisors] = useState<FacultyAdvisorRow[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingHead, setUploadingHead] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const canEdit = !eventState || eventState === "DRAFT";
  const hasDoc = !!state;
  const allSigned = state ? allCouncilSigned(state) : false;
  const facultyOk = selectedFaculty.length > 0;
  const canSubmit = hasDoc && allSigned && facultyOk && canEdit;

  const previewDoc = state
    ? applyFacultyReviewersToDocument(
        state,
        resolveFacultyReviewers(advisors, selectedFaculty),
      )
    : null;

  const prefillFromEvent = useCallback(
    (base: DocumentBuilderState, councilMembers: CouncilMemberRow[]) => {
      if (!event) return base;
      const eventDate = event.dates?.[0]?.slice(0, 10) ?? "";
      const permission = {
        ...base.permission,
        eventName: event.name,
        eventDate,
        venue: event.venue ?? "",
      };
      const next: DocumentBuilderState = {
        ...base,
        kind: "permission_letter",
        eventId,
        permission:
          base.permissionTemplate === "custom"
            ? permission
            : applyPermissionTemplate(base.permissionTemplate, permission),
      };
      if (next.signatories.length === 0) {
        const heads = councilMembers.filter((m) => m.is_head);
        if (heads.length > 0) {
          next.signatories = heads.map((m) => ({
            memberId: m.id,
            name: m.name,
            role: m.role,
          }));
        }
      }
      return next;
    },
    [event, eventId],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetchCouncilProfile(),
      fetchProposal(eventId).catch(() => null),
    ])
      .then(([profile, proposalRes]) => {
        if (cancelled) return;

        const councilName = profile.name ?? "";
        const p = profile.profile ?? {};
        profileLetterheadRef.current = resolveLetterheadUrl(
          p.letterhead_logo,
          profile.photo_url,
          p.banner_url,
        );
        const councilMembers = profile.profile?.members ?? [];
        setMembers(councilMembers);
        setAdvisors(profile.profile?.faculty_advisors ?? []);

        if (proposalRes) {
          setEventState(proposalRes.event_state);
          setSelectedFaculty(proposalRes.assigned_faculty_emails ?? []);
          if (proposalRes.proposal.document) {
            setState(
              mergeCouncilSignatures(
                { ...proposalRes.proposal.document, eventId },
                proposalRes.proposal.councilSignatures ?? [],
              ),
            );
            return;
          }
        }

        const letterheadUrl = profileLetterheadRef.current;
        let base: DocumentBuilderState = {
          kind: "permission_letter",
          permissionTemplate: "event",
          eventId,
          letterheadUrl,
          signatories: [],
          permission: {
            refNo: "",
            date: new Date().toISOString().slice(0, 10),
            recipient:
              "The Director,\nK J Somaiya School of Engineering,\nSomaiya Vidyavihar University",
            subject: "",
            body: "",
            eventName: "",
            eventDate: "",
            venue: "",
            councilName,
            bannerLocation: "",
            publicityChannels: "",
          },
          report: {
            date: "",
            eventName: "",
            eventDate: "",
            venue: "",
            attendance: "",
            summary: "",
            highlights: "",
            outcomes: "",
            conclusion: "",
            councilName,
          },
        };
        base.permission = applyPermissionTemplate("event", base.permission);
        setState(prefillFromEvent(base, councilMembers));
      })
      .catch(() => showToast("Could not load proposal builder."))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, prefillFromEvent]);

  async function persist(next: DocumentBuilderState) {
    const reviewers = resolveFacultyReviewers(advisors, selectedFaculty);
    const withFaculty = applyFacultyReviewersToDocument(next, reviewers);
    setState(withFaculty);
    await saveProposal(
      eventId,
      withFaculty,
      councilSignaturesFromDocument(withFaculty),
    );
  }

  async function handleSave() {
    if (!state) return;
    setSaving(true);
    try {
      await persist(state);
      showToast("Proposal saved.");
    } catch {
      showToast("Could not save proposal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!state || !canSubmit) return;
    setSubmitting(true);
    try {
      await persist(state);
      await submitProposal(eventId, selectedFaculty);
      await refreshEvents();
      showToast("Proposal submitted to faculty!");
      router.push(`/event-details/${eventId}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      showToast(msg ?? "Submit failed — check signatures and faculty selection.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSign(index: number, dataUrl: string) {
    if (!state) return;
    const sig = state.signatories[index];
    const file = dataUrlToFile(dataUrl, `council-sig-${sig.memberId ?? index}.png`);
    const url = await uploadFile(file, "eventio-council-images");
    const next: DocumentBuilderState = {
      ...state,
      signatories: state.signatories.map((x, i) =>
        i === index ? { ...x, signatureUrl: url, signedAt: new Date().toISOString() } : x,
      ),
    };
    setSaving(true);
    try {
      await persist(next);
      showToast(`${sig.name} signed.`);
    } catch {
      showToast("Could not save signature.");
    } finally {
      setSaving(false);
    }
  }

  function selectTemplate(templateId: PermissionTemplateId) {
    setState((s) =>
      s
        ? {
            ...s,
            permissionTemplate: templateId,
            permission: applyPermissionTemplate(templateId, s.permission),
          }
        : s,
    );
  }

  function toggleMemberSignatory(member: CouncilMemberRow) {
    setState((s) => {
      if (!s) return s;
      const selected = s.signatories.some((sig) => sig.memberId === member.id);
      return {
        ...s,
        signatories: selected
          ? s.signatories.filter((sig) => sig.memberId !== member.id)
          : [...s.signatories, { memberId: member.id, name: member.name, role: member.role }],
      };
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] gap-2 text-muted-tx font-fira">
        <Loader2 size={20} className="animate-spin" /> Loading proposal builder…
      </div>
    );
  }

  if (!event) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-muted-tx font-fira mb-4">Event not found.</p>
        <Link href="/" className="text-red-500 text-sm font-fira hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="px-4 py-12 max-w-lg mx-auto text-center space-y-4">
        <ClipboardList size={32} className="mx-auto text-muted-tx" />
        <p className="text-tx font-fira font-semibold">Proposal is read-only</p>
        <p className="text-muted-tx text-sm font-fira">
          This event is no longer in draft. View the submitted proposal from event details.
        </p>
        <Link
          href={`/event-details/${eventId}`}
          className="inline-flex items-center gap-2 text-red-500 text-sm font-fira hover:underline"
        >
          <ArrowLeft size={14} /> Back to event details
        </Link>
      </div>
    );
  }

  const p = state!.permission;

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-[1600px] mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-surface border border-border-c shadow-xl rounded-xl px-4 py-3 text-tx text-sm font-fira">
          {toast}
        </div>
      )}

      <div className="document-builder-chrome mb-6 space-y-4">
        <Link
          href={`/event-details/${eventId}`}
          className="inline-flex items-center gap-1.5 text-sm font-fira text-muted-tx hover:text-tx"
        >
          <ArrowLeft size={15} /> Back to event details
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-fira uppercase tracking-widest text-red-500 mb-1">
              Faculty approval
            </p>
            <h1 className="text-tx text-2xl font-marcellus flex items-center gap-2">
              <ClipboardList size={22} className="text-red-500" />
              Proposal Builder
            </h1>
            <p className="text-muted-tx text-sm font-fira mt-1">
              Compose, sign, and submit the permission letter for{" "}
              <span className="text-tx font-medium">{event.name}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-c bg-surface text-sm font-fira"
            >
              <Printer size={15} /> Print
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || submitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-c bg-surface text-sm font-fira disabled:opacity-50"
            >
              <Save size={15} /> {saving ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || saving || submitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-fira font-medium disabled:opacity-50"
            >
              <Send size={15} /> {submitting ? "Submitting…" : "Submit to faculty"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-surface border border-border-c">
          <StepRow done={hasDoc} label="Letter composed" />
          <StepRow done={allSigned} label="Council signed" />
          <StepRow done={facultyOk} label="Faculty selected" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-8 items-start min-w-0">
        <aside className="document-builder-chrome space-y-5">
          <div className="bg-surface border border-border-c rounded-2xl p-5 space-y-3">
            <p className={LABEL}>Permission template</p>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSION_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => selectTemplate(tpl.id)}
                  className={`text-left py-2.5 px-3 rounded-lg border transition-all ${
                    state!.permissionTemplate === tpl.id
                      ? "bg-red-500/10 border-red-500/30 text-red-500"
                      : "border-border-c text-muted-tx hover:text-tx"
                  }`}
                >
                  <span className="block text-xs font-fira font-semibold">{tpl.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border-c rounded-2xl p-5 space-y-3">
            <p className="text-tx text-sm font-fira font-semibold">Letterhead</p>
            <Letterhead variant="compact" councilLetterheadUrl={state!.letterheadUrl} />
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-c text-xs font-fira cursor-pointer w-fit">
              <Upload size={13} className="text-red-500" />
              {uploadingHead ? "Uploading…" : "Upload logo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingHead}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingHead(true);
                  try {
                    const url = await uploadFile(file, "eventio-council-images");
                    setState((s) => (s ? { ...s, letterheadUrl: url } : s));
                  } finally {
                    setUploadingHead(false);
                    e.target.value = "";
                  }
                }}
              />
            </label>
          </div>

          <div className="bg-surface border border-border-c rounded-2xl p-5 space-y-3">
            <p className="text-tx text-sm font-fira font-semibold">Council signatories</p>
            {members.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {members.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={state!.signatories.some((s) => s.memberId === member.id)}
                      onChange={() => toggleMemberSignatory(member)}
                      className="rounded border-border-c"
                    />
                    <span className="text-sm font-fira truncate">{member.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs font-fira text-muted-tx">
                Add members in <Link href="/settings" className="text-red-500 hover:underline">Settings</Link>.
              </p>
            )}
          </div>

          {state!.signatories.some((s) => s.name.trim() && !s.facultyReviewer) && (
            <CouncilSignatorySigning
              signatories={state!.signatories}
              onSign={handleSign}
              disabled={saving || submitting}
            />
          )}

          <div className="bg-surface border border-border-c rounded-2xl p-5">
            <FacultyReviewerSelect
              advisors={advisors}
              selected={selectedFaculty}
              onChange={setSelectedFaculty}
            />
          </div>

          <div className="bg-surface border border-border-c rounded-2xl p-5 space-y-4 max-h-[50vh] overflow-y-auto">
            <BuilderField label="Reference no." value={p.refNo} onChange={(v) => setState((s) => s ? { ...s, permission: { ...s.permission, refNo: v } } : s)} />
            <BuilderField label="Date" value={p.date} onChange={(v) => setState((s) => s ? { ...s, permission: { ...s.permission, date: v } } : s)} />
            <BuilderField label="To" value={p.recipient} onChange={(v) => setState((s) => s ? { ...s, permission: { ...s.permission, recipient: v } } : s)} multiline rows={5} />
            <BuilderField label="Subject" value={p.subject} onChange={(v) => setState((s) => s ? { ...s, permission: { ...s.permission, subject: v } } : s)} />
            <BuilderField label="Body" value={p.body} onChange={(v) => setState((s) => s ? { ...s, permission: { ...s.permission, body: v } } : s)} multiline rows={6} />
            <BuilderField label="Council name" value={p.councilName} onChange={(v) => setState((s) => s ? { ...s, permission: { ...s.permission, councilName: v } } : s)} />
          </div>
        </aside>

        <div className="document-builder-preview min-w-0 bg-zinc-200/80 dark:bg-zinc-900/50 rounded-2xl p-4 sm:p-8 overflow-x-auto">
          {previewDoc && (
            <DocumentSheet
              sheetRef={sheetRef}
              kind={previewDoc.kind}
              permissionTemplate={previewDoc.permissionTemplate}
              letterheadUrl={previewDoc.letterheadUrl}
              signatories={previewDoc.signatories}
              permission={previewDoc.permission}
              report={previewDoc.report}
            />
          )}
        </div>
      </div>

      <p className="document-builder-chrome mt-6 text-center text-[11px] font-fira text-subtle-tx">
        Need a post-event report or standalone letter? Use{" "}
        <Link href="/document-builder" className="text-red-500 hover:underline">
          Document Builder
        </Link>{" "}
        instead — this page is only for faculty approval proposals.
      </p>
    </div>
  );
}
