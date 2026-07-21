import { marked } from "marked";

export type EmailBodyFormat = "plain" | "markdown" | "html";

marked.setOptions({ gfm: true, breaks: true });

const BLOCKED_TAGS =
  /<\/?(?:script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option)[^>]*>/gi;

export function sanitizeEmailHtml(html: string): string {
  let s = String(html || "");
  s = s.replace(BLOCKED_TAGS, "");
  s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  s = s.replace(/javascript:/gi, "");
  return s.trim();
}

export function markdownToHtml(markdown: string): string {
  const raw = marked.parse(String(markdown || "").trim());
  return sanitizeEmailHtml(typeof raw === "string" ? raw : "");
}

const MD_PATTERN =
  /^#{1,6}\s|\*\*[^*]+\*\*|__[^_]+__|\[[^\]]+\]\([^)]+\)|^[-*+]\s|^>\s|`[^`]+`/m;

/** Heuristic: does this text contain markdown syntax worth rendering? */
export function looksLikeMarkdown(s?: string | null): boolean {
  return !!s && MD_PATTERN.test(s);
}

/** HTML for the message body slot (header logos stay outside this in EmailPreview / template). */
export function renderEmailBodyHtml(body: string, format: EmailBodyFormat = "plain"): string {
  const trimmed = body.trim();
  if (!trimmed) return "";

  switch (format) {
    case "markdown":
      return markdownToHtml(trimmed);
    case "html":
      return sanitizeEmailHtml(trimmed);
    default:
      return trimmed
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((block) => {
          const lines = block
            .split("\n")
            .map((line) =>
              line
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;"),
            )
            .join("<br/>");
          return `<p>${lines}</p>`;
        })
        .join("");
  }
}

export const BODY_FORMAT_OPTIONS: { value: EmailBodyFormat; label: string; hint: string }[] = [
  {
    value: "plain",
    label: "Plain text",
    hint: "Simple paragraphs. Line breaks are preserved.",
  },
  {
    value: "markdown",
    label: "Markdown",
    hint: "Use **bold**, lists, links, and headings. Eventio header logos stay fixed.",
  },
  {
    value: "html",
    label: "HTML",
    hint: "Custom HTML for the message body only — logos and header layout cannot be changed.",
  },
];

export const BODY_FORMAT_PLACEHOLDER: Record<EmailBodyFormat, string> = {
  plain: "Write your message…",
  markdown: `Hello participants,

Registration closes **tomorrow**.

- Bring your college ID
- Reach the venue by 9:00 AM

[View event details](https://example.com)`,
  html: `<p>Hello participants,</p>
<ul>
  <li>Doors open at <strong>9:00 AM</strong></li>
  <li>Carry your college ID</li>
</ul>`,
};
