const express = require("express");
const authCheck = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma_client");
const { get, set, del, keys, TTL, invalidateCouncil } = require("../utils/cache");
const router = express.Router();

const p = "/p";

// ─── helpers ────────────────────────────────────────────────────────

function councilOnly(req, res, next) {
    if (req.user.role !== "COUNCIL") {
        return res.status(403).json({ error: true, message: "Council access only" });
    }
    next();
}

// ─── GET all councils (student-facing) ──────────────────────────────
// POST /api/v1/council/p/get
router.post(p + "/get", authCheck, async (req, res) => {
    const cacheKey = keys.councilList();
    const cached = get(cacheKey);
    if (cached) return res.json(cached);

    try {
        const councils = await prisma.user.findMany({
            where: { role: "COUNCIL" },
            select: {
                id: true,
                name: true,
                photo_url: true,
                email: true,
                phone_number: true,
                council_type: true,
                about: true,
                CouncilProfile: {
                    select: {
                        tagline: true,
                        banner_url: true,
                        instagram: true,
                        website: true,
                        faculty_advisors: true,
                    },
                },
            },
        });

        const payload = { error: false, councils };
        set(cacheKey, payload, TTL.COUNCIL);
        return res.json(payload);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// ─── GET single council profile (by id) ─────────────────────────────
// GET /api/v1/council/p/profile/:id
router.get(p + "/profile/:id", authCheck, async (req, res) => {
    const id = parseInt(req.params.id);
    const cacheKey = keys.councilProfile(id);
    const cached = get(cacheKey);
    if (cached) return res.json(cached);

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                photo_url: true,
                role: true,
                council_type: true,
                about: true,
                CouncilProfile: true,
                Events: {
                    where: { state: { notIn: ["DRAFT", "PRIVATE"] } },
                    select: {
                        id: true, name: true, banner_url: true, state: true,
                        dates: true, venue: true, fee: true, tags: true,
                        logo_image__url: true,
                        organizer: {
                            select: {
                                id: true,
                                name: true,
                                photo_url: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: { created_at: "desc" },
                },
            },
        });

        if (!user || user.role !== "COUNCIL") {
            return res.status(404).json({ error: true, message: "Council not found" });
        }

        const payload = { error: false, council: user };
        set(cacheKey, payload, TTL.COUNCIL);
        return res.json(payload);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// ─── GET own profile (council-facing) ───────────────────────────────
// GET /api/v1/council/p/me
router.get(p + "/me", authCheck, councilOnly, async (req, res) => {
    try {
        const profile = await prisma.councilProfile.findUnique({
            where: { user_id: req.user.id },
        });
        return res.json({ error: false, profile: profile ?? {} });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// ─── UPDATE own profile (council-facing) ────────────────────────────
// PUT /api/v1/council/p/me
router.put(p + "/me", authCheck, councilOnly, async (req, res) => {
    const { tagline, about, banner_url, instagram, website, faculty_advisors, members } = req.body;

    try {
        const profile = await prisma.councilProfile.upsert({
            where: { user_id: req.user.id },
            create: {
                user_id: req.user.id,
                tagline, about, banner_url, instagram, website,
                faculty_advisors: faculty_advisors ?? [],
                members: members ?? [],
            },
            update: {
                ...(tagline !== undefined && { tagline }),
                ...(about !== undefined && { about }),
                ...(banner_url !== undefined && { banner_url }),
                ...(instagram !== undefined && { instagram }),
                ...(website !== undefined && { website }),
                ...(faculty_advisors !== undefined && { faculty_advisors }),
                ...(members !== undefined && { members }),
            },
        });

        // Also update basic user fields if present
        const userUpdate = {};
        if (req.body.name) userUpdate.name = req.body.name;
        if (req.body.photo_url) userUpdate.photo_url = req.body.photo_url;
        if (req.body.council_type) userUpdate.council_type = req.body.council_type;
        if (req.body.about) userUpdate.about = req.body.about;

        if (Object.keys(userUpdate).length > 0) {
            await prisma.user.update({ where: { id: req.user.id }, data: userUpdate });
        }

        invalidateCouncil(req.user.id);
        return res.json({ error: false, profile, message: "Profile updated" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// ─── Members management ──────────────────────────────────────────────
// GET /api/v1/council/p/members
router.get(p + "/members", authCheck, councilOnly, async (req, res) => {
    try {
        const profile = await prisma.councilProfile.findUnique({
            where: { user_id: req.user.id },
            select: { members: true },
        });
        return res.json({ error: false, members: profile?.members ?? [] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// POST /api/v1/council/p/members — replace full members array
router.post(p + "/members", authCheck, councilOnly, async (req, res) => {
    const { members } = req.body;
    if (!Array.isArray(members)) {
        return res.status(400).json({ error: true, message: "members must be an array" });
    }
    try {
        await prisma.councilProfile.upsert({
            where: { user_id: req.user.id },
            create: { user_id: req.user.id, members },
            update: { members },
        });
        invalidateCouncil(req.user.id);
        return res.json({ error: false, message: "Members updated" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

module.exports = router;
