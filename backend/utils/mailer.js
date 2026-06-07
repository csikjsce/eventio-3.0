const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const {
    buildEventioEmail,
    buildAnnouncementEmail,
    buildTeamInviteEmail,
    textToHtml,
} = require("./email-template");

dotenv.config();

const FROM = () => `"Eventio" <${process.env.EMAIL_USER}>`;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/** Detect emails already rendered with the Eventio layout. */
function isEventioTemplate(html) {
    if (!html || typeof html !== "string") return false;
    return (
        html.includes("Somaiya Vidyavihar University") &&
        html.includes("linear-gradient(90deg")
    );
}

/**
 * Low-level send — html must already be a full document.
 * @param {{ to?: string|string[], bcc?: string|string[], subject: string, html: string }} opts
 */
async function sendMail(opts) {
    const { to, bcc, subject, html } = opts;
    if (!subject || !html) {
        throw new Error("subject and html are required");
    }
    if (!to && !bcc) {
        throw new Error("to or bcc is required");
    }

    const info = await transporter.sendMail({
        from: FROM(),
        ...(to ? { to } : {}),
        ...(bcc ? { bcc } : {}),
        subject,
        html,
    });

    console.log("Eventio email sent: %s", info.messageId);
    return info;
}

/**
 * Wrap plain text or partial HTML in the Eventio template unless already wrapped.
 */
function ensureEventioTemplate(subject, content, extra = {}) {
    if (isEventioTemplate(content)) return content;

    const bodyHtml =
        content.includes("<") && content.includes(">")
            ? content
            : textToHtml(content);

    return buildEventioEmail({
        title: extra.title || subject,
        preheader: extra.preheader || (typeof content === "string" ? content.slice(0, 120) : ""),
        bodyHtml,
        badge: extra.badge || "",
        ctaLabel: extra.ctaLabel || "",
        ctaUrl: extra.ctaUrl || "",
        footerNote: extra.footerNote,
    });
}

/** Generic templated email (plain-text body). */
async function sendGenericEmail(to, subject, { title, body, badge, footerNote, ctaLabel, ctaUrl } = {}) {
    const html = buildEventioEmail({
        title: title || subject,
        preheader: (body || "").slice(0, 120),
        bodyHtml: textToHtml(body || ""),
        badge: badge || "",
        ctaLabel: ctaLabel || "",
        ctaUrl: ctaUrl || "",
        footerNote,
    });
    return sendMail({ to, subject, html });
}

/** Event announcement blast (BCC). */
async function sendAnnouncementEmail(recipients, title, body, eventName, bodyFormat = "plain") {
    if (!recipients?.length) return null;
    const html = buildAnnouncementEmail({ title, body, eventName, bodyFormat });
    return sendMail({ bcc: recipients, subject: title, html });
}

/** Team creation / invite code email. */
async function sendTeamInviteEmail(to, subject, teamName, teamCode, eventName) {
    const html = buildTeamInviteEmail({ teamName, teamCode, eventName });
    return sendMail({ to, subject, html });
}

/**
 * Legacy helper — always wraps content in the Eventio template unless already wrapped.
 * @deprecated Prefer sendGenericEmail or typed helpers.
 */
async function sendEmail(to, subject, htmlOrBody, templateOpts = {}) {
    const html = ensureEventioTemplate(subject, htmlOrBody, templateOpts);
    return sendMail({ to, subject, html });
}

module.exports = {
    sendMail,
    sendEmail,
    sendGenericEmail,
    sendAnnouncementEmail,
    sendTeamInviteEmail,
    ensureEventioTemplate,
    isEventioTemplate,
};
