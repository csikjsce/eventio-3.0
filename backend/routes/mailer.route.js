const express = require("express");
const { sendEmail, sendGenericEmail } = require("../utils/mailer.js");

const router = express.Router();

router.post("/send-email", async (req, res) => {
    const { to, subject, html, body, title, badge, footerNote, ctaLabel, ctaUrl } = req.body;

    if (!to || !subject) {
        return res.status(400).json({ error: "Missing required fields: to, subject" });
    }

    const content = body ?? html;
    if (!content?.trim()) {
        return res.status(400).json({ error: "Missing required field: body or html" });
    }

    try {
        if (body && !html) {
            await sendGenericEmail(to, subject, { title, body, badge, footerNote, ctaLabel, ctaUrl });
        } else {
            await sendEmail(to, subject, content, { title, badge, footerNote, ctaLabel, ctaUrl });
        }
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Failed to send email:", error.message);
        res.status(500).json({ error: "Failed to send email", message: error.message });
    }
});

module.exports = router;
