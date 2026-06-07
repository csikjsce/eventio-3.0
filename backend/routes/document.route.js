const express = require("express");
const authCheck = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma_client");
const { get, set, del, keys, TTL } = require("../utils/cache");
const { facultyCanAccessEvent } = require("../utils/faculty-access");
const router = express.Router();

const p = "/p";

// Only the council that owns the event or faculty/principal can manage docs
async function requireEventAccess(req, res, next) {
    const eventId = parseInt(req.params.eventId || req.body.event_id);
    if (!eventId) return res.status(400).json({ error: true, message: "event_id required" });

    const event = await prisma.events.findUnique({
        where: { id: eventId },
        select: {
            organizer_id: true,
            state: true,
            assigned_faculty_emails: true,
        },
    });
    if (!event) return res.status(404).json({ error: true, message: "Event not found" });

    const role = req.user.role;
    if (role === "COUNCIL" && event.organizer_id !== req.user.id) {
        return res.status(403).json({ error: true, message: "Not your event" });
    }
    if (role === "FACULTY") {
        const allowed = await facultyCanAccessEvent(req.user, event);
        if (!allowed) {
            return res.status(403).json({
                error: true,
                message: "You do not have access to this council event.",
            });
        }
    }
    if (!["COUNCIL", "FACULTY", "PRINCIPAL", "ADMIN"].includes(role)) {
        return res.status(403).json({ error: true, message: "Access denied" });
    }

    req.eventId = eventId;
    next();
}

// GET /api/v1/document/p/:eventId — list docs for an event
router.get(p + "/:eventId", authCheck, requireEventAccess, async (req, res) => {
    const cacheKey = keys.docs(req.eventId);
    const cached = get(cacheKey);
    if (cached) return res.json(cached);

    try {
        const docs = await prisma.eventDocument.findMany({
            where: { event_id: req.eventId },
            orderBy: { uploaded_at: "desc" },
        });
        const payload = { error: false, documents: docs };
        set(cacheKey, payload, TTL.DOCS);
        return res.json(payload);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// POST /api/v1/document/p — add a document
router.post(p, authCheck, requireEventAccess, async (req, res) => {
    const { name, type, url, required } = req.body;
    if (!name || !type || !url) {
        return res.status(400).json({ error: true, message: "name, type, url required" });
    }

    const VALID_TYPES = ["PROPOSAL", "REPORT", "GEOTAG", "BUDGET", "CERTIFICATE", "OTHER"];
    if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({ error: true, message: "Invalid document type" });
    }

    try {
        const doc = await prisma.eventDocument.create({
            data: {
                event_id: req.eventId,
                name,
                type,
                url,
                required: required ?? false,
            },
        });
        del(keys.docs(req.eventId));
        return res.status(201).json({ error: false, document: doc });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// PUT /api/v1/document/p/:docId — update a document's URL or name
router.put(p + "/:docId", authCheck, async (req, res) => {
    const docId = parseInt(req.params.docId);
    const { name, url } = req.body;

    try {
        const existing = await prisma.eventDocument.findUnique({ where: { id: docId } });
        if (!existing) return res.status(404).json({ error: true, message: "Document not found" });

        const event = await prisma.events.findUnique({ where: { id: existing.event_id }, select: { organizer_id: true } });
        if (req.user.role === "COUNCIL" && event.organizer_id !== req.user.id) {
            return res.status(403).json({ error: true, message: "Not your event" });
        }

        const doc = await prisma.eventDocument.update({
            where: { id: docId },
            data: {
                ...(name && { name }),
                ...(url && { url }),
            },
        });
        del(keys.docs(existing.event_id));
        return res.json({ error: false, document: doc });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// DELETE /api/v1/document/p/:docId
router.delete(p + "/:docId", authCheck, async (req, res) => {
    const docId = parseInt(req.params.docId);

    try {
        const existing = await prisma.eventDocument.findUnique({ where: { id: docId } });
        if (!existing) return res.status(404).json({ error: true, message: "Document not found" });

        const event = await prisma.events.findUnique({ where: { id: existing.event_id }, select: { organizer_id: true } });
        if (req.user.role === "COUNCIL" && event.organizer_id !== req.user.id) {
            return res.status(403).json({ error: true, message: "Not your event" });
        }

        await prisma.eventDocument.delete({ where: { id: docId } });
        del(keys.docs(existing.event_id));
        return res.json({ error: false, message: "Document deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

module.exports = router;
