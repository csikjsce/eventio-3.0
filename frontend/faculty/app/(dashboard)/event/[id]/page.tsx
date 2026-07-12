"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CalendarDays, MapPin, Users, Ticket,
  FileText, Wallet, Clock, ExternalLink, Loader2,
  AlertCircle, RotateCcw,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import {
  fetchEvent, fetchDocuments, fetchBudget,
  returnEventToCouncil,
} from "@/lib/api";
import {
  facultySignProposal,
  fetchProposal,
  userHasSignature,
  type ProposalPackage,
  type AssignedFacultyReviewer,
} from "@/lib/proposal";
import ProposalDocumentView from "@/components/ProposalDocumentView";
import { PenLine } from "lucide-react";
import { ApprovalTimeline } from "@/components/EventCard";
import type { EventData, EventDocument, BudgetItem } from "@/lib/types";
import { STATE_BADGE, fmtDate, PENDING_STATE } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "overview" | "proposal" | "documents" | "budget" | "journey";

export default function EventReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EventReviewContent key={id} id={id} />;
}

function EventReviewContent({ id }: { id: string }) {
  const router = useRouter();
  const { user, refresh } = useData();

  const [event, setEvent]       = useState<EventData | null>(null);
  const [docs, setDocs]         = useState<EventDocument[]>([]);
  const [budget, setBudget]     = useState<BudgetItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Tab>("overview");
  const [busy, setBusy]         = useState(false);
  const [showReturnBox, setShowReturnBox] = useState(false);
  const [returnFeedback, setReturnFeedback] = useState("");
  const [sendToPrincipal, setSendToPrincipal] = useState(false);
  const [proposal, setProposal] = useState<ProposalPackage | null>(null);
  const [facultyReviewers, setFacultyReviewers] = useState<
    AssignedFacultyReviewer[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchEvent(id),
      fetchDocuments(id).catch(() => []),
      fetchBudget(id).catch(() => []),
      fetchProposal(id).catch(() => ({ proposal: null, assigned_faculty_reviewers: [] })),
    ])
      .then(([ev, d, b, propRes]) => {
        if (cancelled) return;
        setEvent(ev);
        setDocs(d);
        setBudget(b);
        setProposal(propRes?.proposal ?? null);
        setFacultyReviewers(propRes?.assigned_faculty_reviewers ?? []);
      })
      .catch(() => { if (!cancelled) setEvent(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const pendingState = user?.role ? PENDING_STATE[user.role] : null;
  const canApprove   = !!(event && pendingState && event.state === pendingState);
  const isPrincipal  = user?.role === "PRINCIPAL";

  const alreadySigned = proposal?.facultySignatures?.some(
    (s) => s.user_id === user?.id,
  );
  const hasSavedSignature = userHasSignature(user?.signature);
  const hasProposalDoc = !!proposal?.document;

  useEffect(() => {
    if (canApprove && hasProposalDoc) {
      setTab("proposal");
    }
  }, [canApprove, hasProposalDoc, id]);

  async function approve() {
    if (!event) return;
    if (!hasProposalDoc) return;
    if (!alreadySigned) return;
    setBusy(true);
    try {
      await facultySignProposal(event.id, {
        approve: true,
        sendToPrincipal: isPrincipal ? false : sendToPrincipal,
      });
      await refresh();
      router.push("/pending");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      alert(msg ?? "Approval failed.");
    } finally {
      setBusy(false);
    }
  }

  async function signProposalOnly() {
    if (!event || !hasProposalDoc) return;
    setBusy(true);
    try {
      await facultySignProposal(event.id, { approve: false });
      const { proposal: updated, assigned_faculty_reviewers } = await fetchProposal(event.id);
      setProposal(updated);
      setFacultyReviewers(assigned_faculty_reviewers);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      alert(msg ?? "Could not sign proposal.");
    } finally {
      setBusy(false);
    }
  }

  function ReviewActions() {
    if (!canApprove) return null;

    return (
      <div className="mt-6 pt-6 border-t border-border space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Your review</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasProposalDoc
                ? "Read the proposal above, sign it, then approve or return to council."
                : "No proposal letter yet — you can still return this to council with feedback."}
            </p>
          </div>
          {alreadySigned && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ You have signed this proposal
            </span>
          )}
        </div>

        {!hasProposalDoc && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-sm text-amber-800 dark:text-amber-300">
            The council has not submitted a proposal letter yet. Approve is blocked until they do — return with feedback if they need to fix something first.
          </div>
        )}

        {!hasSavedSignature && hasProposalDoc && (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <Link href="/settings" className="underline font-medium">
              Add your digital signature in Settings
            </Link>{" "}
            before signing.
          </p>
        )}

        {!isPrincipal && hasProposalDoc && (
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sendToPrincipal}
              onChange={(e) => setSendToPrincipal(e.target.checked)}
              className="rounded border-border"
            />
            Requires Principal approval
          </label>
        )}

        <div className="flex flex-wrap gap-2">
          {hasProposalDoc && !alreadySigned && hasSavedSignature && (
            <button
              type="button"
              onClick={signProposalOnly}
              disabled={busy}
              className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <PenLine size={14} />}
              Sign proposal
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowReturnBox((v) => !v)}
            disabled={busy}
            className="px-4 py-2.5 rounded-lg border border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 text-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            <RotateCcw size={14} />
            Return to Council
          </button>
          {hasProposalDoc && (
            <button
              type="button"
              onClick={approve}
              disabled={busy || !hasSavedSignature || !alreadySigned}
              className="px-4 py-2.5 rounded-lg border border-border bg-muted/50 hover:bg-muted text-sm font-medium disabled:opacity-40 flex items-center gap-2"
              title={!alreadySigned ? "Sign the proposal first" : undefined}
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              {isPrincipal
                ? "Approve event"
                : sendToPrincipal
                  ? "Forward to Principal"
                  : "Approve event"}
            </button>
          )}
        </div>
      </div>
    );
  }

  async function returnToCouncil() {
    if (!event || !returnFeedback.trim()) return;
    setBusy(true);
    try {
      await returnEventToCouncil(event.id, returnFeedback.trim());
      await refresh();
      router.push("/pending");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      alert(msg ?? "Could not return event to council. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Event not found.</p>
        <Link href="/" className="text-red-600 text-sm mt-2 inline-block hover:underline">Go back</Link>
      </div>
    );
  }

  const badge = STATE_BADGE[event.state] ?? { label: event.state, cls: "bg-muted text-muted-foreground" };
  const budgetTotal = budget.reduce((s, i) => s + (i.amount ?? 0), 0);

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3 min-w-0">
          <Link href="/pending"
            className="w-8 h-8 mt-1 rounded-lg bg-card border border-border hover:border-red-500/30 flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0">
            <ArrowLeft size={15} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl sm:text-2xl font-marcellus text-foreground leading-tight">{event.name}</h1>
              <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-md", badge.cls)}>
                {badge.label}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              by {event.organizer?.name}
              {event.organizer?.email && ` · ${event.organizer.email}`}
            </p>
          </div>
        </div>

        {canApprove && !hasProposalDoc && (
          <p className="text-xs text-amber-700 dark:text-amber-400 shrink-0">
            Awaiting council proposal letter
          </p>
        )}
      </div>

      {/* Return-to-council feedback box */}
      {showReturnBox && canApprove && (
        <div className="mb-5 p-4 bg-amber-500/5 border border-amber-500/25 rounded-xl">
          <p className="text-amber-800 dark:text-amber-300 text-sm font-medium mb-1">
            Send back for changes
          </p>
          <p className="text-muted-foreground text-xs mb-3">
            The event will return to the council as a draft. They&apos;ll see your feedback and can edit and resubmit.
          </p>
          <textarea
            value={returnFeedback}
            onChange={(e) => setReturnFeedback(e.target.value)}
            rows={4}
            placeholder="Describe what needs to be changed (e.g. update budget, fix venue details, upload revised proposal…)"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500/50 resize-none mb-3"
          />
          <div className="flex gap-2">
            <button type="button" onClick={returnToCouncil} disabled={busy || !returnFeedback.trim()}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm disabled:opacity-50">
              Send Back to Council
            </button>
            <button type="button" onClick={() => { setShowReturnBox(false); setReturnFeedback(""); }}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Previous return feedback */}
      {event.comment && (
        <div className="mb-5 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Feedback sent to council</p>
            <p className="text-sm text-muted-foreground mt-1 italic">&ldquo;{event.comment}&rdquo;</p>
          </div>
        </div>
      )}

      {/* Banner */}
      {event.banner_url && (
        <div className="rounded-2xl overflow-hidden mb-6 aspect-[21/9] bg-muted">
          <img src={event.banner_url} alt={event.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Info strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: <CalendarDays size={14} />, label: "Date",  value: fmtDate(event.dates[0]) },
          { icon: <MapPin size={14} />,      label: "Venue", value: event.venue || "TBD" },
          { icon: <Users size={14} />,       label: "Team",  value: event.min_ppt === event.ma_ppt ? `${event.min_ppt}` : `${event.min_ppt}–${event.ma_ppt}` },
          { icon: <Ticket size={14} />,      label: "Seats", value: event.is_ticket_feature_enabled ? `${event.ticket_count}` : "N/A" },
        ].map((info) => (
          <div key={info.label} className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">{info.icon}
              <span className="text-[10px] uppercase tracking-wide">{info.label}</span>
            </div>
            <p className="text-sm font-semibold truncate">{info.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit mb-4 flex-wrap">
        {([
          ["overview",  "Overview"],
          ["proposal",  "Proposal"],
          ["documents", `Documents (${docs.length})`],
          ["budget",    `Budget (${budget.length})`],
          ["journey",   "State History"],
        ] as [Tab, string][]).map(([t, label]) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm transition-all",
              tab === t ? "bg-red-600 text-white font-medium" : "text-muted-foreground hover:text-foreground",
            )}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
        {tab === "overview" && (
          <div className="space-y-4">
            {event.tag_line && (
              <p className="text-muted-foreground text-sm italic">{event.tag_line}</p>
            )}
            <div>
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {event.description || "No description provided."}
              </p>
            </div>
            {event.long_description && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Detailed Description</h3>
                <div className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: event.long_description }} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                ["Event Type", event.event_type?.replace(/_/g, " ")],
                ["Entry Fee",  event.fee ? `₹${event.fee}` : "Free"],
                ["Somaiya Only", event.is_only_somaiya ? "Yes" : "No"],
                ["Tickets", event.is_ticket_feature_enabled ? "Enabled" : "Disabled"],
              ].map(([k, v]) => (
                <div key={k} className="bg-muted/50 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</p>
                  <p className="text-sm font-medium mt-0.5 capitalize">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "proposal" && (
          <>
            {proposal?.document ? (
              <ProposalDocumentView
                proposal={proposal}
                facultyReviewers={facultyReviewers}
              />
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">
                The council has not submitted a proposal document for this event yet.
              </p>
            )}
            <ReviewActions />
          </>
        )}

        {tab === "documents" && (
          docs.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={16} className="text-red-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{doc.type?.replace(/_/g, " ")}</p>
                    </div>
                  </div>
                  {doc.url ? (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs shrink-0 hover:underline">
                      View <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not uploaded</span>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {tab === "budget" && (
          budget.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No budget items submitted.</p>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Wallet size={15} /> Budget Breakdown
                </p>
                <p className="text-lg font-bold">₹{budgetTotal.toLocaleString("en-IN")}</p>
              </div>
              <div className="space-y-2">
                {budget.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    <p className="text-sm font-semibold">₹{item.amount.toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {tab === "journey" && (
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Clock size={15} /> State History
              <span className="text-muted-foreground font-normal text-xs">
                ({event.state_history.length} transitions)
              </span>
            </h3>
            <ApprovalTimeline chain={event.approval_chain} />
          </div>
        )}
      </div>
    </div>
  );
}
