const { marked } = require("marked");

marked.setOptions({ gfm: true, breaks: true });

const FONT_BODY = "'Fira Sans', Arial, Helvetica, sans-serif";
const COLOR_TEXT = "#18181b";
const COLOR_MUTED = "#52525b";

const BLOCKED_TAGS = /<\/?(?:script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option)[^>]*>/gi;

function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/** Strip dangerous markup; council-authored HTML only goes in the body slot below the fixed header. */
function sanitizeEmailHtml(html) {
    let s = String(html || "");
    s = s.replace(BLOCKED_TAGS, "");
    s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
    s = s.replace(/javascript:/gi, "");
    return s.trim();
}

function markdownToHtml(markdown) {
    const raw = marked.parse(String(markdown || "").trim());
    return sanitizeEmailHtml(typeof raw === "string" ? raw : "");
}

function wrapEmailBodyInnerHtml(innerHtml) {
    if (!innerHtml) return "";
    return `<div style="font-family:${FONT_BODY};font-size:15px;line-height:1.65;color:${COLOR_TEXT};">${innerHtml}</div>`;
}

/**
 * Render announcement body HTML for the template body slot (logos/header unchanged).
 * @param {"plain"|"markdown"|"html"} format
 */
function renderAnnouncementBodyHtml(body, format = "plain", eventName) {
    const eventLine = eventName
        ? `<p style="margin:0 0 16px;font-family:${FONT_BODY};font-size:13px;color:${COLOR_MUTED};"><strong style="color:${COLOR_TEXT};">Event:</strong> ${escapeHtml(eventName)}</p>`
        : "";

    let contentHtml = "";
    switch (format) {
        case "markdown":
            contentHtml = wrapEmailBodyInnerHtml(markdownToHtml(body));
            break;
        case "html":
            contentHtml = wrapEmailBodyInnerHtml(sanitizeEmailHtml(body));
            break;
        default: {
            const trimmed = (body || "").trim();
            if (!trimmed) break;
            contentHtml = trimmed
                .split(/\n{2,}/)
                .map((block) => {
                    const lines = block.split("\n").map(escapeHtml).join("<br/>");
                    return `<p style="margin:0 0 16px;font-family:${FONT_BODY};font-size:15px;line-height:1.65;color:${COLOR_TEXT};">${lines}</p>`;
                })
                .join("");
            break;
        }
    }

    return `${eventLine}${contentHtml}`;
}

module.exports = {
    sanitizeEmailHtml,
    markdownToHtml,
    renderAnnouncementBodyHtml,
};
