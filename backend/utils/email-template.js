/**
 * Eventio-branded HTML email templates.
 * Colours match frontend/app globals: primary #b61f2d, bg #f5f5f7, surface #ffffff.
 *
 * All outbound mail must go through utils/mailer.js (never nodemailer directly).
 */

const { renderAnnouncementBodyHtml } = require("./email-body");

const BRAND = {
    primary: "#b61f2d",
    primaryDark: "#991b1b",
    vitality: "#ee1d23",
    bg: "#f5f5f7",
    surface: "#ffffff",
    text: "#18181b",
    muted: "#52525b",
    subtle: "#71717a",
    border: "#e4e4e7",
    accentBg: "#fef2f2",
};

/** Same typefaces as frontend apps (next/font: Marcellus + Fira Sans). */
const FONT = {
    body: "'Fira Sans', Arial, Helvetica, sans-serif",
    heading: "'Marcellus', Georgia, 'Times New Roman', serif",
};

const EMAIL_FONT_HEAD = `<link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Marcellus&display=swap" rel="stylesheet" />
  <style>
    body, table, td, p, a, li { font-family: ${FONT.body}; }
    h1, h2, h3, .eventio-heading { font-family: ${FONT.heading}; }
  </style>`;

function assetBaseUrl() {
    return (process.env.CLIENT_URL || process.env.COUNCIL_CLIENT_URL || process.env.SERVER_URL || "").replace(/\/$/, "");
}

function logoUrl() {
    const base = assetBaseUrl();
    return base ? `${base}/EventioLogo.svg` : "";
}

function somaiyaLogoUrl() {
    const base = assetBaseUrl();
    return base ? `${base}/somaiya-kjsce-logo.png` : "";
}

function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/** Plain text with newlines → safe HTML paragraphs. */
function textToHtml(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return "";
    return trimmed
        .split(/\n{2,}/)
        .map((block) => {
            const lines = block.split("\n").map(escapeHtml).join("<br/>");
            return `<p style="margin:0 0 16px;font-family:${FONT.body};font-size:15px;line-height:1.65;color:${BRAND.text};">${lines}</p>`;
        })
        .join("");
}

/**
 * Core Eventio email layout.
 * @param {object} opts
 * @param {string} opts.title - Main heading
 * @param {string} [opts.preheader] - Inbox preview text
 * @param {string} opts.bodyHtml - Inner HTML (already escaped where needed)
 * @param {string} [opts.badge] - Small label above title e.g. "Announcement"
 * @param {string} [opts.ctaLabel]
 * @param {string} [opts.ctaUrl]
 * @param {string} [opts.footerNote]
 */
function buildEventioEmail(opts) {
    const {
        title,
        preheader = "",
        bodyHtml,
        badge = "",
        ctaLabel = "",
        ctaUrl = "",
        footerNote = "You received this email from Eventio — Somaiya Vidyavihar University.",
    } = opts;

    const logo = logoUrl();
    const somaiyaLogo = somaiyaLogoUrl();
    const safeTitle = escapeHtml(title);
    const safeBadge = badge ? escapeHtml(badge) : "";
    const safePreheader = escapeHtml(preheader || title);
    const safeFooter = escapeHtml(footerNote);
    const safeCtaLabel = escapeHtml(ctaLabel);
    const safeCtaUrl = escapeHtml(ctaUrl);

    const logoBlock = logo
        ? `<img src="${escapeHtml(logo)}" alt="Eventio" width="36" height="36" style="display:block;border:0;outline:none;" />`
        : `<div style="width:36px;height:36px;border-radius:10px;background:${BRAND.primary};color:#fff;font-family:${FONT.heading};font-size:18px;font-weight:bold;line-height:36px;text-align:center;">E</div>`;

    const somaiyaLogoBlock = somaiyaLogo
        ? `<img src="${escapeHtml(somaiyaLogo)}" alt="Somaiya Vidyavihar University" height="48" style="display:block;height:48px;width:auto;max-width:140px;border:0;outline:none;margin-left:auto;" />`
        : "";

    const ctaBlock =
        ctaLabel && ctaUrl
            ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;">
                <tr>
                  <td style="border-radius:10px;background:${BRAND.primary};">
                    <a href="${safeCtaUrl}" target="_blank" style="display:inline-block;padding:12px 24px;font-family:${FONT.body};font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">${safeCtaLabel}</a>
                  </td>
                </tr>
              </table>`
            : "";

    const badgeBlock = safeBadge
        ? `<p style="margin:0 0 8px;font-family:${FONT.body};font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.primary};">${safeBadge}</p>`
        : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${safeTitle}</title>
  ${EMAIL_FONT_HEAD}
  <!--[if mso]><style>body,table,td,p,a{font-family:Arial,Helvetica,sans-serif!important;}h1{font-family:Georgia,'Times New Roman',serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:${FONT.body};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${safePreheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          <!-- Accent bar — straight edges (outside rounded card) -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${BRAND.primary} 0%,${BRAND.vitality} 100%);font-size:0;line-height:0;border-radius:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.surface};border:1px solid ${BRAND.border};border-top:none;border-radius:0 0 16px 16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:24px 32px 16px;border-bottom:1px solid ${BRAND.border};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="44" valign="middle">${logoBlock}</td>
                  <td valign="middle" style="padding-left:12px;">
                    <p style="margin:0;font-family:${FONT.heading};font-size:22px;line-height:1;color:${BRAND.primary};">Eventio</p>
                    <p style="margin:4px 0 0;font-family:${FONT.body};font-size:11px;color:${BRAND.subtle};">Somaiya Vidyavihar University</p>
                  </td>
                  <td valign="middle" align="right" style="padding-left:16px;width:1%;white-space:nowrap;">${somaiyaLogoBlock}</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${badgeBlock}
              <h1 style="margin:0 0 20px;font-family:${FONT.heading};font-size:26px;line-height:1.25;font-weight:normal;color:${BRAND.text};">${safeTitle}</h1>
              ${bodyHtml}
              ${ctaBlock}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px;background-color:${BRAND.bg};border-top:1px solid ${BRAND.border};">
              <p style="margin:0;font-family:${FONT.body};font-size:12px;line-height:1.6;color:${BRAND.subtle};">${safeFooter}</p>
            </td>
          </tr>
        </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Highlight box for key values (team code, dates, etc.). */
function buildInfoBox(rows) {
    const items = rows
        .filter((r) => r.value)
        .map(
            (r) => `<tr>
          <td style="padding:8px 0;font-family:${FONT.body};font-size:13px;color:${BRAND.subtle};width:120px;vertical-align:top;">${escapeHtml(r.label)}</td>
          <td style="padding:8px 0;font-family:${FONT.body};font-size:14px;font-weight:600;color:${BRAND.text};vertical-align:top;">${escapeHtml(r.value)}</td>
        </tr>`,
        )
        .join("");

    if (!items) return "";

    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;background:${BRAND.accentBg};border:1px solid #fecaca;border-radius:12px;">
      <tr><td style="padding:16px 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items}</table></td></tr>
    </table>`;
}

function buildAnnouncementEmail({ title, body, eventName, bodyFormat = "plain" }) {
    return buildEventioEmail({
        title,
        preheader: body.slice(0, 120),
        badge: eventName ? "Event announcement" : "Announcement",
        bodyHtml: renderAnnouncementBodyHtml(body, bodyFormat, eventName),
        footerNote: "You received this because you are registered for the event on Eventio.",
    });
}

function buildTeamInviteEmail({ teamName, teamCode, eventName }) {
    const bodyHtml =
        textToHtml(
            "Your team has been created successfully. Share the invite code below so teammates can join.",
        ) +
        buildInfoBox([
            { label: "Team", value: teamName },
            { label: "Invite code", value: teamCode },
            ...(eventName ? [{ label: "Event", value: eventName }] : []),
        ]) +
        `<p style="margin:0;font-family:${FONT.body};font-size:14px;line-height:1.65;color:${BRAND.muted};">Keep this code safe — teammates will need it to join your team on Eventio.</p>`;

    const clientUrl = (process.env.CLIENT_URL || "").replace(/\/$/, "");

    return buildEventioEmail({
        title: "Your team is ready",
        preheader: `Team ${teamName} — invite code ${teamCode}`,
        badge: "Team registration",
        bodyHtml,
        ctaLabel: clientUrl ? "Open Eventio" : "",
        ctaUrl: clientUrl || "",
        footerNote: "This email confirms your team registration on Eventio.",
    });
}

module.exports = {
    BRAND,
    FONT,
    escapeHtml,
    textToHtml,
    buildEventioEmail,
    buildInfoBox,
    buildAnnouncementEmail,
    buildTeamInviteEmail,
};
