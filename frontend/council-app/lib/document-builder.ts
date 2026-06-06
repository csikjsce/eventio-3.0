export type DocumentKind = "permission_letter" | "report";

export const SOMAIYA_KJSCE_LOGO = "/somaiya-kjsce-logo.png";

export interface DocumentSignatory {
  memberId?: number;
  name: string;
  role: string;
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
  eventId: string;
  letterheadUrl: string;
  signatories: DocumentSignatory[];
  permission: PermissionLetterFields;
  report: ReportFields;
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
    permission,
    report,
    signatories,
    letterheadUrl,
  };
}

export function buildDefaultState(councilName = ""): DocumentBuilderState {
  return {
    kind: "permission_letter",
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
