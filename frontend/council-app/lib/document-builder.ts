export type DocumentKind = "permission_letter" | "report";

export type PermissionTemplateId = "event" | "venue" | "banner" | "pr" | "custom";

export const SOMAIYA_KJSCE_LOGO = "/somaiya-kjsce-logo.png";

export interface PermissionTemplateMeta {
  id: PermissionTemplateId;
  label: string;
  description: string;
}

export const PERMISSION_TEMPLATES: PermissionTemplateMeta[] = [
  {
    id: "event",
    label: "Event Permission",
    description: "General permission to conduct an event on campus",
  },
  {
    id: "venue",
    label: "Venue Permission",
    description: "Permission to book and use a specific venue or room",
  },
  {
    id: "banner",
    label: "Banner Permission",
    description: "Permission to display banners, posters, or standees",
  },
  {
    id: "pr",
    label: "PR Permission",
    description: "Permission for publicity, announcements, and social media",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Write your own subject, body, and recipient",
  },
];

export interface DocumentSignatory {
  memberId?: number;
  name: string;
  role: string;
  email?: string;
  /** Faculty reviewer selected for proposal approval — signs after council. */
  facultyReviewer?: boolean;
  signatureUrl?: string;
  signedAt?: string;
}

export interface PermissionLetterFields {
  refNo: string;
  date: string;
  recipient: string;
  subject: string;
  body: string;
  eventName: string;
  eventDate: string;
  venue: string;
  councilName: string;
  /** Banner / standee placement locations (banner template). */
  bannerLocation: string;
  /** Publicity channels e.g. Instagram, notice boards (PR template). */
  publicityChannels: string;
}

export interface ReportFields {
  date: string;
  eventName: string;
  eventDate: string;
  venue: string;
  attendance: string;
  summary: string;
  highlights: string;
  outcomes: string;
  conclusion: string;
  councilName: string;
}

export interface DocumentBuilderState {
  kind: DocumentKind;
  permissionTemplate: PermissionTemplateId;
  eventId: string;
  letterheadUrl: string;
  signatories: DocumentSignatory[];
  permission: PermissionLetterFields;
  report: ReportFields;
  /** Snapshot of faculty reviewers selected for this proposal. */
  assignedFacultyReviewers?: AssignedFacultyReviewer[];
}

export interface AssignedFacultyReviewer {
  name: string;
  email: string;
  designation?: string;
  dept?: string;
}

interface TemplateContext {
  councilName: string;
  eventName?: string;
  eventDate?: string;
  venue?: string;
  bannerLocation?: string;
  publicityChannels?: string;
}

const DEFAULT_RECIPIENT =
  "The Director,\nK J Somaiya School of Engineering,\nSomaiya Vidyavihar University";

function templateSubject(id: PermissionTemplateId, ctx: TemplateContext): string {
  const name = ctx.eventName?.trim() || "[Event Name]";
  const venue = ctx.venue?.trim() || "[Venue]";

  switch (id) {
    case "event":
      return `Permission for conducting ${name}`;
    case "venue":
      return `Permission for use of ${venue} — ${name}`;
    case "banner":
      return `Permission for display of promotional banners — ${name}`;
    case "pr":
      return `Permission for publicity and communications — ${name}`;
    case "custom":
      return "";
  }
}

function templateBody(id: PermissionTemplateId, ctx: TemplateContext): string {
  const council = ctx.councilName.trim() || "our council";
  const name = ctx.eventName?.trim() || "[Event Name]";
  const venue = ctx.venue?.trim() || "[Venue]";
  const location = ctx.bannerLocation?.trim() || "[Banner location(s)]";
  const channels = ctx.publicityChannels?.trim() || "[Publicity channels]";

  switch (id) {
    case "event":
      return (
        `We, on behalf of ${council}, hereby request your kind permission to conduct the event "${name}" under the aegis of our council.\n\n` +
        "All necessary arrangements regarding faculty supervision, student safety, crowd management, and compliance with institute guidelines shall be ensured. We shall submit the event report and attendance details upon completion."
      );
    case "venue":
      return (
        `We, on behalf of ${council}, hereby request your kind permission to use ${venue} for conducting "${name}".\n\n` +
        "The venue shall be used solely for the stated purpose. We undertake to maintain cleanliness, adhere to the institute's time schedule, and restore the venue to its original condition after use."
      );
    case "banner":
      return (
        `We, on behalf of ${council}, hereby request your kind permission to display promotional banners, posters, and standees for "${name}" at ${location}.\n\n` +
        "All displayed material shall be decent, non-political, and in line with institute branding guidelines. Banners shall be removed promptly after the publicity period ends."
      );
    case "pr":
      return (
        `We, on behalf of ${council}, hereby request your kind permission to carry out publicity and communications for "${name}" through ${channels}.\n\n` +
        "All content shall be factual, respectful, and approved by the faculty advisor before publication. We shall comply with the institute's social media and communication policies."
      );
    case "custom":
      return "";
  }
}

function templateRecipient(id: PermissionTemplateId): string {
  switch (id) {
    case "venue":
      return "The Estate Officer,\nK J Somaiya School of Engineering,\nSomaiya Vidyavihar University";
    case "custom":
      return DEFAULT_RECIPIENT;
    case "banner":
    case "pr":
      return DEFAULT_RECIPIENT;
    case "event":
    default:
      return DEFAULT_RECIPIENT;
  }
}

/** Apply a permission template, preserving user-entered event details where possible. */
export function applyPermissionTemplate(
  templateId: PermissionTemplateId,
  existing: PermissionLetterFields,
): PermissionLetterFields {
  if (templateId === "custom") {
    return {
      ...existing,
      date: existing.date || todayISO(),
    };
  }

  const ctx: TemplateContext = {
    councilName: existing.councilName,
    eventName: existing.eventName,
    eventDate: existing.eventDate,
    venue: existing.venue,
    bannerLocation: existing.bannerLocation,
    publicityChannels: existing.publicityChannels,
  };

  return {
    ...existing,
    date: existing.date || todayISO(),
    recipient: templateRecipient(templateId),
    subject: templateSubject(templateId, ctx),
    body: templateBody(templateId, ctx),
  };
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDisplayDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function defaultPermissionFields(councilName = ""): PermissionLetterFields {
  return {
    refNo: "",
    date: todayISO(),
    recipient: "The Director,\nK J Somaiya School of Engineering,\nSomaiya Vidyavihar University",
    subject: "",
    body:
      "We hereby request your kind permission to conduct the above-mentioned event under the aegis of our council. All necessary arrangements regarding venue, faculty supervision, and student safety shall be ensured as per institute guidelines.",
    eventName: "",
    eventDate: "",
    venue: "",
    councilName,
    bannerLocation: "",
    publicityChannels: "Instagram, LinkedIn, and institute notice boards",
  };
}

export function defaultReportFields(councilName = ""): ReportFields {
  return {
    date: todayISO(),
    eventName: "",
    eventDate: "",
    venue: "",
    attendance: "",
    summary: "",
    highlights: "",
    outcomes: "",
    conclusion: "",
    councilName,
  };
}

/** Migrate older drafts that stored a single signatory on permission/report fields. */
export function normalizeDraft(raw: Partial<DocumentBuilderState>): DocumentBuilderState {
  const base = buildDefaultState();
  const permission = { ...base.permission, ...raw.permission };
  const report = { ...base.report, ...raw.report };

  let signatories = Array.isArray(raw.signatories) ? raw.signatories : [];

  if (signatories.length === 0) {
    const legacy = raw.permission as PermissionLetterFields & {
      signatoryName?: string;
      signatoryRole?: string;
    };
    const legacyReport = raw.report as ReportFields & { submittedBy?: string };

    if (legacy?.signatoryName?.trim()) {
      signatories = [{ name: legacy.signatoryName.trim(), role: legacy.signatoryRole?.trim() ?? "" }];
    } else if (legacyReport?.submittedBy?.trim()) {
      signatories = [{ name: legacyReport.submittedBy.trim(), role: "" }];
    }
  }

  // Drop stale letterhead URLs saved when banner_url was reused for letterhead.
  const letterheadUrl =
    raw.letterheadUrl && typeof raw.letterheadUrl === "string" ? raw.letterheadUrl : "";

  return {
    ...base,
    ...raw,
    permission: {
      ...permission,
      bannerLocation: permission.bannerLocation ?? "",
      publicityChannels: permission.publicityChannels ?? "Instagram, LinkedIn, and institute notice boards",
    },
    report,
    signatories,
    letterheadUrl,
    permissionTemplate: raw.permissionTemplate ?? "event",
    assignedFacultyReviewers: Array.isArray(raw.assignedFacultyReviewers)
      ? raw.assignedFacultyReviewers
      : [],
  };
}

export function buildDefaultState(councilName = ""): DocumentBuilderState {
  return {
    kind: "permission_letter",
    permissionTemplate: "event",
    eventId: "",
    letterheadUrl: "",
    signatories: [],
    permission: defaultPermissionFields(councilName),
    report: defaultReportFields(councilName),
  };
}

/** Council letterhead slot: dedicated logo first, then council logo — never the banner. */
export function resolveLetterheadUrl(
  letterheadLogo?: string | null,
  councilLogo?: string | null,
  bannerUrl?: string | null,
  draftUrl?: string,
): string {
  if (letterheadLogo?.trim()) return letterheadLogo.trim();
  if (councilLogo?.trim()) return councilLogo.trim();
  const draft = draftUrl?.trim();
  if (draft && draft !== bannerUrl?.trim()) return draft;
  return "";
}

function normEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Resolve selected faculty advisor rows from council settings. */
export function resolveFacultyReviewers(
  advisors: Array<{
    name: string;
    email: string;
    designation?: string;
    dept?: string;
  }>,
  selectedEmails: string[],
): AssignedFacultyReviewer[] {
  const selected = new Set(selectedEmails.map(normEmail));
  return advisors
    .filter((a) => selected.has(normEmail(a.email)))
    .map((a) => ({
      name: a.name,
      email: a.email.trim(),
      designation: a.designation,
      dept: a.dept,
    }));
}

/** Faculty reviewers as signatory slots on the permission letter. */
export function facultyReviewersToSignatories(
  reviewers: AssignedFacultyReviewer[],
): DocumentSignatory[] {
  return reviewers.map((r) => ({
    name: r.name,
    email: r.email.trim(),
    role: r.designation?.trim() || "Faculty Advisor",
    facultyReviewer: true,
  }));
}

/** Embed selected faculty as signatories on the proposal document. */
export function applyFacultyReviewersToDocument(
  doc: DocumentBuilderState,
  reviewers: AssignedFacultyReviewer[],
): DocumentBuilderState {
  const councilSignatories = doc.signatories.filter((s) => !s.facultyReviewer);

  if (reviewers.length === 0) {
    return { ...doc, assignedFacultyReviewers: [], signatories: councilSignatories };
  }

  const existingByEmail = new Map(
    doc.signatories
      .filter((s) => s.facultyReviewer && s.email)
      .map((s) => [normEmail(s.email!), s]),
  );

  const facultySignatories = facultyReviewersToSignatories(reviewers).map((f) => {
    const prev = existingByEmail.get(normEmail(f.email!));
    if (!prev?.signatureUrl) return f;
    return {
      ...f,
      signatureUrl: prev.signatureUrl,
      signedAt: prev.signedAt,
    };
  });

  return {
    ...doc,
    assignedFacultyReviewers: reviewers,
    signatories: [...councilSignatories, ...facultySignatories],
  };
}

const DRAFT_KEY = "council_document_builder_draft";

export function loadDraft(): DocumentBuilderState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? normalizeDraft(JSON.parse(raw) as Partial<DocumentBuilderState>) : null;
  } catch {
    return null;
  }
}

export function saveDraft(state: DocumentBuilderState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}
