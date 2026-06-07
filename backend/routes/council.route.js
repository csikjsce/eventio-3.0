const express = require("express");
const authCheck = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma_client");
const { get, set, del, TTL, keys, invalidateCouncil } = require("../utils/cache");
const router = express.Router();

const p = "/p";

// ─── helpers ────────────────────────────────────────────────────────

function councilOnly(req, res, next) {
    if (req.user.role !== "COUNCIL") {
        return res.status(403).json({ error: true, message: "Council access only" });
    }
    next();
}

/** Resolve the CouncilProfile id for the authenticated council user. */
async function getProfileId(userId) {
    const profile = await prisma.councilProfile.findUnique({
        where: { user_id: userId },
        select: { id: true },
    });
    return profile?.id ?? null;
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
                phone_number: true,
                role: true,
                council_type: true,
                about: true,
                CouncilProfile: {
                    include: {
                        members: { orderBy: [{ is_head: "desc" }, { created_at: "asc" }] },
                        faculty_advisors: { orderBy: { created_at: "asc" } },
                    },
                },
                Events: {
                    where: { state: { notIn: ["DRAFT", "PRIVATE"] } },
                    select: {
                        id: true, name: true, banner_url: true, state: true,
                        dates: true, venue: true, fee: true, tags: true,
                        logo_image__url: true,
                        organizer: {
                            select: { id: true, name: true, photo_url: true, email: true },
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
    const cacheKey = `council:me:${req.user.id}`;
    const cached = get(cacheKey);
    if (cached) return res.json(cached);

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                photo_url: true,
                phone_number: true,
                council_type: true,
                about: true,
                CouncilProfile: {
                    include: {
                        members: { orderBy: [{ is_head: "desc" }, { created_at: "asc" }] },
                        faculty_advisors: { orderBy: { created_at: "asc" } },
                    },
                },
            },
        });

        if (!user) return res.status(404).json({ error: true, message: "User not found" });

        const payload = {
            error: false,
            council: {
                id:           user.id,
                name:         user.name,
                email:        user.email,
                photo_url:    user.photo_url,
                phone_number: user.phone_number,
                council_type: user.council_type,
                about:        user.about,
                profile:      user.CouncilProfile ?? {},
            },
        };
        set(cacheKey, payload, TTL.COUNCIL);
        return res.json(payload);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// ─── UPDATE own profile (council-facing) ────────────────────────────
// PUT /api/v1/council/p/me
router.put(p + "/me", authCheck, councilOnly, async (req, res) => {
    const { tagline, about, banner_url, letterhead_logo, instagram, linkedin, website } = req.body;

    try {
        const profile = await prisma.councilProfile.upsert({
            where: { user_id: req.user.id },
            create: {
                user_id: req.user.id,
                tagline, about, banner_url, letterhead_logo, instagram, linkedin, website,
            },
            update: {
                ...(tagline          !== undefined && { tagline }),
                ...(about            !== undefined && { about }),
                ...(banner_url       !== undefined && { banner_url }),
                ...(letterhead_logo  !== undefined && { letterhead_logo }),
                ...(instagram        !== undefined && { instagram }),
                ...(linkedin         !== undefined && { linkedin }),
                ...(website          !== undefined && { website }),
            },
        });

        // Also update basic user fields if present
        const userUpdate = {};
        if (req.body.name)         userUpdate.name         = req.body.name;
        if (req.body.photo_url)    userUpdate.photo_url    = req.body.photo_url;
        if (req.body.council_type) userUpdate.council_type = req.body.council_type;
        if (req.body.phone_number !== undefined) {
            userUpdate.phone_number =
                req.body.phone_number === null || req.body.phone_number === ""
                    ? null
                    : String(req.body.phone_number);
        } else if (req.body.phone !== undefined) {
            userUpdate.phone_number =
                req.body.phone === null || req.body.phone === ""
                    ? null
                    : String(req.body.phone);
        }

        if (Object.keys(userUpdate).length > 0) {
            await prisma.user.update({ where: { id: req.user.id }, data: userUpdate });
        }

        invalidateCouncil(req.user.id);
        del(`council:me:${req.user.id}`);
        return res.json({ error: false, profile, message: "Profile updated" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// ════════════════════════════════════════════════════════════════════
// ── MEMBER CRUD ──────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

// POST /api/v1/council/p/members — create one member
router.post(p + "/members", authCheck, councilOnly, async (req, res) => {
    const { name, email, role, team, is_head, photo_url } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: true, message: "name and email are required" });
    }
    try {
        const profileId = await getProfileId(req.user.id);
        if (!profileId) {
            // Auto-create profile row if it doesn't exist yet
            await prisma.councilProfile.create({ data: { user_id: req.user.id } });
            const newProfileId = await getProfileId(req.user.id);
            if (!newProfileId) {
                return res.status(500).json({ error: true, message: "Could not create council profile" });
            }
        }

        const id = profileId ?? (await getProfileId(req.user.id));

        const member = await prisma.councilMember.create({
            data: {
                council_id: id,
                name, email,
                role:      role      ?? "Member",
                team:      team      ?? "Technical",
                is_head:   is_head   ?? false,
                photo_url: photo_url ?? null,
            },
        });

        del(`council:me:${req.user.id}`);
        invalidateCouncil(req.user.id);
        return res.status(201).json({ error: false, member });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// PUT /api/v1/council/p/members/:id — update one member
router.put(p + "/members/:id", authCheck, councilOnly, async (req, res) => {
    const memberId = parseInt(req.params.id);
    const { name, email, role, team, is_head, photo_url } = req.body;
    try {
        // Ownership guard
        const existing = await prisma.councilMember.findUnique({
            where: { id: memberId },
            include: { council: { select: { user_id: true } } },
        });
        if (!existing || existing.council.user_id !== req.user.id) {
            return res.status(403).json({ error: true, message: "Forbidden" });
        }

        const member = await prisma.councilMember.update({
            where: { id: memberId },
            data: {
                ...(name      !== undefined && { name }),
                ...(email     !== undefined && { email }),
                ...(role      !== undefined && { role }),
                ...(team      !== undefined && { team }),
                ...(is_head   !== undefined && { is_head }),
                ...(photo_url !== undefined && { photo_url }),
            },
        });

        del(`council:me:${req.user.id}`);
        invalidateCouncil(req.user.id);
        return res.json({ error: false, member });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// DELETE /api/v1/council/p/members/:id — delete one member
router.delete(p + "/members/:id", authCheck, councilOnly, async (req, res) => {
    const memberId = parseInt(req.params.id);
    try {
        const existing = await prisma.councilMember.findUnique({
            where: { id: memberId },
            include: { council: { select: { user_id: true } } },
        });
        if (!existing || existing.council.user_id !== req.user.id) {
            return res.status(403).json({ error: true, message: "Forbidden" });
        }

        await prisma.councilMember.delete({ where: { id: memberId } });

        del(`council:me:${req.user.id}`);
        invalidateCouncil(req.user.id);
        return res.json({ error: false, message: "Member deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// ════════════════════════════════════════════════════════════════════
// ── FACULTY ADVISOR CRUD ─────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

// POST /api/v1/council/p/advisors — create one advisor
router.post(p + "/advisors", authCheck, councilOnly, async (req, res) => {
    const { name, email, dept, designation } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: true, message: "name and email are required" });
    }
    try {
        let profileId = await getProfileId(req.user.id);
        if (!profileId) {
            await prisma.councilProfile.create({ data: { user_id: req.user.id } });
            profileId = await getProfileId(req.user.id);
        }

        const advisor = await prisma.facultyAdvisor.create({
            data: {
                council_id:  profileId,
                name, email,
                dept:        dept        ?? "",
                designation: designation ?? "Faculty Advisor",
            },
        });

        del(`council:me:${req.user.id}`);
        invalidateCouncil(req.user.id);
        return res.status(201).json({ error: false, advisor });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// PUT /api/v1/council/p/advisors/:id — update one advisor
router.put(p + "/advisors/:id", authCheck, councilOnly, async (req, res) => {
    const advisorId = parseInt(req.params.id);
    const { name, email, dept, designation } = req.body;
    try {
        const existing = await prisma.facultyAdvisor.findUnique({
            where: { id: advisorId },
            include: { council: { select: { user_id: true } } },
        });
        if (!existing || existing.council.user_id !== req.user.id) {
            return res.status(403).json({ error: true, message: "Forbidden" });
        }

        const advisor = await prisma.facultyAdvisor.update({
            where: { id: advisorId },
            data: {
                ...(name        !== undefined && { name }),
                ...(email       !== undefined && { email }),
                ...(dept        !== undefined && { dept }),
                ...(designation !== undefined && { designation }),
            },
        });

        del(`council:me:${req.user.id}`);
        invalidateCouncil(req.user.id);
        return res.json({ error: false, advisor });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// DELETE /api/v1/council/p/advisors/:id — delete one advisor
router.delete(p + "/advisors/:id", authCheck, councilOnly, async (req, res) => {
    const advisorId = parseInt(req.params.id);
    try {
        const existing = await prisma.facultyAdvisor.findUnique({
            where: { id: advisorId },
            include: { council: { select: { user_id: true } } },
        });
        if (!existing || existing.council.user_id !== req.user.id) {
            return res.status(403).json({ error: true, message: "Forbidden" });
        }

        await prisma.facultyAdvisor.delete({ where: { id: advisorId } });

        del(`council:me:${req.user.id}`);
        invalidateCouncil(req.user.id);
        return res.json({ error: false, message: "Advisor deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

module.exports = router;
