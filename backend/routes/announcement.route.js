const express = require("express");
const authCheck = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma_client");
const { sendAnnouncementEmail } = require("../utils/mailer");
const { get, set, del, keys, TTL } = require("../utils/cache");
const router = express.Router();

const p = "/p";

// ─── Access check ────────────────────────────────────────────────────

async function requireCouncilEventAccess(req, res, next) {
    const eventId = parseInt(req.params.eventId || req.body.event_id);
    if (!eventId) return res.status(400).json({ error: true, message: "event_id required" });

    if (!["COUNCIL", "FACULTY", "PRINCIPAL", "ADMIN"].includes(req.user.role)) {
        return res.status(403).json({ error: true, message: "Access denied" });
    }
    if (req.user.role === "COUNCIL") {
        const event = await prisma.events.findUnique({ where: { id: eventId }, select: { organizer_id: true } });
        if (!event) return res.status(404).json({ error: true, message: "Event not found" });
        if (event.organizer_id !== req.user.id) {
            return res.status(403).json({ error: true, message: "Not your event" });
        }
    }
    req.eventId = eventId;
    next();
}

// ─── GET announcements for event ─────────────────────────────────────
// GET /api/v1/announcement/p/:eventId
router.get(p + "/:eventId", authCheck, requireCouncilEventAccess, async (req, res) => {
    const cacheKey = keys.announcements(req.eventId);
    const cached = get(cacheKey);
    if (cached) return res.json(cached);

    try {
        const announcements = await prisma.announcement.findMany({
            where: { event_id: req.eventId },
            include: { created_by: { select: { name: true, photo_url: true } } },
            orderBy: { sent_at: "desc" },
        });
        const payload = { error: false, announcements };
        set(cacheKey, payload, TTL.ANNOUNCEMENTS);
        return res.json(payload);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// ─── POST send announcement ──────────────────────────────────────────
// POST /api/v1/announcement/p
router.post(p, authCheck, requireCouncilEventAccess, async (req, res) => {
    const { title, body: msgBody, channel, all_participants } = req.body;

    if (!title || !msgBody || !channel) {
        return res.status(400).json({ error: true, message: "title, body, channel required" });
    }
    const VALID_CHANNELS = ["EMAIL", "PUSH", "BOTH"];
    if (!VALID_CHANNELS.includes(channel)) {
        return res.status(400).json({ error: true, message: "channel must be EMAIL, PUSH, or BOTH" });
    }

    try {
        // Collect recipient emails if sending by email
        let recipientEmails = [];
        if (channel === "EMAIL" || channel === "BOTH") {
            const participants = await prisma.participant.findMany({
                where: {
                    event_id: req.eventId,
                    payment_status: { in: ["SUCCESS", "MANUAL"] },
                },
                include: { user: { select: { email: true } } },
            });
            recipientEmails = participants
                .map(p => p.user?.email)
                .filter(Boolean);
        }

        const announcement = await prisma.announcement.create({
            data: {
                event_id: req.eventId,
                title,
                body: msgBody,
                channel,
                recipient_count: recipientEmails.length,
                created_by_id: req.user.id,
            },
        });

        const eventRecord = await prisma.events.findUnique({
            where: { id: req.eventId },
            select: { name: true },
        });

        // Fire-and-forget email sending
        if (recipientEmails.length > 0) {
            sendAnnouncementEmail(
                recipientEmails,
                title,
                msgBody,
                eventRecord?.name,
            ).catch(console.error);
        }

        del(keys.announcements(req.eventId));
        return res.status(201).json({
            error: false,
            announcement,
            recipients_queued: recipientEmails.length,
            message: `Announcement sent via ${channel}`,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// ─── DELETE announcement ─────────────────────────────────────────────
// DELETE /api/v1/announcement/p/:announcementId
router.delete(p + "/:announcementId", authCheck, async (req, res) => {
    const announcementId = parseInt(req.params.announcementId);

    try {
        const existing = await prisma.announcement.findUnique({ where: { id: announcementId } });
        if (!existing) return res.status(404).json({ error: true, message: "Announcement not found" });

        if (req.user.role === "COUNCIL") {
            const event = await prisma.events.findUnique({ where: { id: existing.event_id }, select: { organizer_id: true } });
            if (event.organizer_id !== req.user.id) {
                return res.status(403).json({ error: true, message: "Not your event" });
            }
        }

        await prisma.announcement.delete({ where: { id: announcementId } });
        del(keys.announcements(existing.event_id));
        return res.json({ error: false, message: "Announcement deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

module.exports = router;
