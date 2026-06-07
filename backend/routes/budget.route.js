const express = require("express");
const authCheck = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma_client");
const { get, set, del, keys, TTL } = require("../utils/cache");
const { facultyCanAccessEvent } = require("../utils/faculty-access");
const router = express.Router();

const p = "/p";

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

    if (req.user.role === "FACULTY") {
        const event = await prisma.events.findUnique({
            where: { id: eventId },
            select: {
                organizer_id: true,
                state: true,
                assigned_faculty_emails: true,
            },
        });
        if (!event) return res.status(404).json({ error: true, message: "Event not found" });
        const allowed = await facultyCanAccessEvent(req.user, event);
        if (!allowed) {
            return res.status(403).json({
                error: true,
                message: "You do not have access to this council event.",
            });
        }
    }

    req.eventId = eventId;
    next();
}

// GET /api/v1/budget/p/:eventId — list budget items
router.get(p + "/:eventId", authCheck, requireCouncilEventAccess, async (req, res) => {
    const cacheKey = keys.budget(req.eventId);
    const cached = get(cacheKey);
    if (cached) return res.json(cached);

    try {
        const items = await prisma.budgetItem.findMany({
            where: { event_id: req.eventId },
            orderBy: { date: "desc" },
        });

        const income = items.filter(i => i.type === "INCOME").reduce((s, i) => s + i.amount, 0);
        const expense = items.filter(i => i.type === "EXPENSE").reduce((s, i) => s + i.amount, 0);

        const payload = { error: false, items, summary: { income, expense, net: income - expense } };
        set(cacheKey, payload, TTL.BUDGET);
        return res.json(payload);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// POST /api/v1/budget/p — add a budget item
router.post(p, authCheck, requireCouncilEventAccess, async (req, res) => {
    const { category, description, amount, type, date } = req.body;

    if (!category || !description || amount === undefined || !type) {
        return res.status(400).json({ error: true, message: "category, description, amount, type required" });
    }
    if (!["INCOME", "EXPENSE"].includes(type)) {
        return res.status(400).json({ error: true, message: "type must be INCOME or EXPENSE" });
    }
    if (typeof amount !== "number" || amount < 0) {
        return res.status(400).json({ error: true, message: "amount must be a non-negative number" });
    }

    try {
        const item = await prisma.budgetItem.create({
            data: {
                event_id: req.eventId,
                category,
                description,
                amount,
                type,
                date: date ? new Date(date) : new Date(),
            },
        });
        del(keys.budget(req.eventId));
        return res.status(201).json({ error: false, item });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// PUT /api/v1/budget/p/:itemId — update a budget item
router.put(p + "/:itemId", authCheck, async (req, res) => {
    const itemId = parseInt(req.params.itemId);

    try {
        const existing = await prisma.budgetItem.findUnique({ where: { id: itemId } });
        if (!existing) return res.status(404).json({ error: true, message: "Item not found" });

        if (req.user.role === "COUNCIL") {
            const event = await prisma.events.findUnique({ where: { id: existing.event_id }, select: { organizer_id: true } });
            if (event.organizer_id !== req.user.id) {
                return res.status(403).json({ error: true, message: "Not your event" });
            }
        }

        const { category, description, amount, type, date } = req.body;
        const item = await prisma.budgetItem.update({
            where: { id: itemId },
            data: {
                ...(category && { category }),
                ...(description && { description }),
                ...(amount !== undefined && { amount }),
                ...(type && { type }),
                ...(date && { date: new Date(date) }),
            },
        });
        del(keys.budget(existing.event_id));
        return res.json({ error: false, item });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// DELETE /api/v1/budget/p/:itemId
router.delete(p + "/:itemId", authCheck, async (req, res) => {
    const itemId = parseInt(req.params.itemId);

    try {
        const existing = await prisma.budgetItem.findUnique({ where: { id: itemId } });
        if (!existing) return res.status(404).json({ error: true, message: "Item not found" });

        if (req.user.role === "COUNCIL") {
            const event = await prisma.events.findUnique({ where: { id: existing.event_id }, select: { organizer_id: true } });
            if (event.organizer_id !== req.user.id) {
                return res.status(403).json({ error: true, message: "Not your event" });
            }
        }

        await prisma.budgetItem.delete({ where: { id: itemId } });
        del(keys.budget(existing.event_id));
        return res.json({ error: false, message: "Budget item deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

module.exports = router;
