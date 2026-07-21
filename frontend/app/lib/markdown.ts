import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

const BLOCKED_TAGS =
  /<\/?(?:script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option)[^>]*>/gi;

function sanitizeHtml(html: string): string {
  let s = String(html || "");
  s = s.replace(BLOCKED_TAGS, "");
  s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  s = s.replace(/javascript:/gi, "");
  return s.trim();
}

export function markdownToHtml(markdown: string): string {
  const raw = marked.parse(String(markdown || "").trim());
  return sanitizeHtml(typeof raw === "string" ? raw : "");
}

const MD_PATTERN =
  /^#{1,6}\s|\*\*[^*]+\*\*|__[^_]+__|\[[^\]]+\]\([^)]+\)|^[-*+]\s|^>\s|`[^`]+`/m;

/** Heuristic: does this text contain markdown syntax worth rendering? */
export function looksLikeMarkdown(s?: string | null): boolean {
  return !!s && MD_PATTERN.test(s);
}
