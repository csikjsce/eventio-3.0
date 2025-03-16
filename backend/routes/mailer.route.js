const express = require("express");
const sendEmail = require("../utils/mailer.js");

const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { to, subject, html } = req.body;
  console.log(req.body, "request received");
  if (!to || !subject || !html) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await sendEmail(to, subject, html);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Failed to send email:", error.message);
    res.status(500).json({ error: "Failed to send email", message: error.message });
  }
});

module.exports = router;