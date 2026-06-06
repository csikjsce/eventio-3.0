const express = require("express");
const PDFDocument = require("pdfkit");
const authCheck = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma_client");
const { Prisma } = require("@prisma/client");
const logger = require("../utils/logger");
const validateUpdateFields = require("../middleware/field-validator.middlware");
const router = express.Router();
const sendMail = require("../utils/nmail");
const fetch = require("node-fetch");
const { get: cGet, set: cSet, del: cDel, keys: cKeys, TTL, invalidateEvent } = require("../utils/cache");
const { validateMoreDetails, normalizeRegistrationFields } = require("../utils/registration-fields");

let protected = "/p";

function generateRandomCode() {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvqxyz0123456789";
    let code = "";
    const length = 5;
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

async function assertCouncilEventAccess(user, eventId) {
    if (user.role !== "COUNCIL") return null;

    const event = await prisma.events.findUnique({
        where: { id: eventId },
        select: { organizer_id: true },
    });
    if (!event) {
        return { status: 404, message: "Event not found" };
    }
    if (event.organizer_id !== user.id) {
        return { status: 403, message: "Not your event" };
    }
    return null;
}

// ── Public event metadata (no auth — used by social crawlers / generateMetadata) ──
router.get("/public/:id", async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        if (isNaN(eventId)) return res.status(400).json({ error: true, message: "Invalid id" });

        const PUBLIC_META_STATES = new Set([
            "UPCOMING", "REGISTRATION_OPEN", "REGISTRATION_CLOSED",
            "TICKET_OPEN", "TICKET_CLOSED", "ONGOING", "COMPLETED",
        ]);

        const event = await prisma.events.findUnique({
            where: { id: eventId },
            select: {
                id: true,
                name: true,
                tag_line: true,
                description: true,
                banner_url: true,
                event_page_image_url: true,
                logo_image__url: true,
                state: true,
                dates: true,
                venue: true,
                organizer: { select: { name: true } },
            },
        });

        if (!event || !PUBLIC_META_STATES.has(event.state)) {
            return res.status(404).json({ error: true, message: "Event not found" });
        }

        res.json({
            error: false,
            meta: {
                id:          event.id,
                name:        event.name,
                tagline:     event.tag_line,
                description: event.description,
                image:       event.event_page_image_url || event.banner_url || null,
                dates:       event.dates,
                venue:       event.venue,
                organizer:   event.organizer?.name ?? null,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Error fetching event metadata" });
    }
});

router.post(protected + "/get", authCheck, async (req, res) => {
    console.log(req.query);
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    // Handle COUNCIL role
    if (req.user.role === "COUNCIL") {
        const councilCacheKey = cKeys.eventListCouncil(req.user.id);
        const councilCached = cGet(councilCacheKey);
        if (councilCached) return res.json(councilCached);

        try {
            let events = [];
            events = await prisma.events.findMany({
                where: { organizer_id: req.user.id },
                relationLoadStrategy: "join",
                include: {
                    organizer: {
                        select: {
                            name: true,
                            photo_url: true,
                            id: true,
                            email: true,
                        },
                    },
                    children: {
                        select: {
                            id: true,
                        },
                    },
                },
            });
            let event = {};
            events.forEach((e) => {
                if (!event[e.state]) [(event[e.state] = [])];
                event[e.state].push(e);
            });
            const councilPayload = {
                error: false,
                events: event,
                message: "Events fetched successfully",
            };
            cSet(councilCacheKey, councilPayload, TTL.EVENT_LIST);
            return res.json(councilPayload);
        } catch (err) {
            console.log(err);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    }

    // Handle PRINCIPAL role
    else if (req.user.role === "PRINCIPAL") {
        try {
            let events = [];
            if (req.query.state) {
                events = await prisma.events.findMany({
                    where: {
                        state: {
                            in: req.query.state,
                        },
                    },
                    relationLoadStrategy: "join",
                    include: {
                        organizer: {
                            select: {
                                name: true,
                                photo_url: true,
                                id: true,
                                email: true,
                            },
                        },
                        children: {
                            select: {
                                id: true,
                            },
                        },
                    },
                });
            } else {
                events = await prisma.events.findMany({
                    where: {
                        state: {
                            in: ["APPLIED_FOR_PRINCI_APPROVAL"],
                        },
                    },
                    relationLoadStrategy: "join",
                    include: {
                        organizer: {
                            select: {
                                name: true,
                                photo_url: true,
                                id: true,
                                email: true,
                            },
                        },
                        children: {
                            select: {
                                id: true,
                            },
                        },
                    },
                });
            }
            let event = {};
            events.forEach((e) => {
                if (!event[e.state]) [(event[e.state] = [])];
                event[e.state].push(e);
            });
            return res.json({
                error: false,
                events: event,
                message: "Events fetched successfully for principal approval",
            });
        } catch (err) {
            console.log(err);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    }

    // Handle FACULTY role (existing)
    else if (req.user.role === "FACULTY") {
        try {
            let events = [];
            if (req.query.state) {
                events = await prisma.events.findMany({
                    where: {
                        state: {
                            in: req.query.state,
                        },
                    },
                    relationLoadStrategy: "join",
                    include: {
                        organizer: {
                            select: {
                                name: true,
                                photo_url: true,
                                id: true,
                                email: true,
                            },
                        },
                        children: {
                            select: {
                                id: true,
                            },
                        },
                    },
                });
            } else {
                events = await prisma.events.findMany({
                    where: {
                        state: {
                            in: [
                                "APPLIED_FOR_APPROVAL",
                                "UPCOMING",
                                "REGISTRATION_OPEN",
                                "REGISTRATION_CLOSED",
                                "TICKET_OPEN",
                                "TICKET_CLOSED",
                                "ONGOING",
                                "COMPLETED",
                                "APPLIED_FOR_PRINCI_APPROVAL",
                            ],
                        },
                    },
                    relationLoadStrategy: "join",
                    include: {
                        organizer: {
                            select: {
                                name: true,
                                photo_url: true,
                                id: true,
                                email: true,
                            },
                        },
                        children: {
                            select: {
                                id: true,
                            },
                        },
                    },
                });
            }
            let event = {};
            events.forEach((e) => {
                if (!event[e.state]) [(event[e.state] = [])];
                event[e.state].push(e);
            });
            return res.json({
                error: false,
                events: event,
                message: "Events fetched successfully for state ",
            });
        } catch (err) {
            console.log(err);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    }

    // Handle other roles (existing)
    if (req.user.is_somaiya_student) {
        try {
            let events = [];
            if (req.query.state) {
                events = await prisma.events.findMany({
                    where: {
                        state: {
                            in: req.query.state,
                        },
                    },
                    relationLoadStrategy: "join",
                    include: {
                        Participant: {
                            where: {
                                user_id: req.user.id,
                            },
                            select: { attended: true, ticket_collected: true },
                        },
                        organizer: {
                            select: {
                                name: true,
                                photo_url: true,
                                id: true,
                                email: true,
                            },
                        },
                        children: {
                            select: {
                                id: true,
                            },
                        },
                    },
                });
            } else {
                events = await prisma.events.findMany({
                    where: {
                        state: {
                            in: [
                                "UPCOMING",
                                "REGISTRATION_OPEN",
                                "REGISTRATION_CLOSED",
                                "TICKET_OPEN",
                                "TICKET_CLOSED",
                                "ONGOING",
                            ],
                        },
                    },
                    relationLoadStrategy: "join",
                    include: {
                        Participant: {
                            where: {
                                user_id: req.user.id,
                            },
                            select: { attended: true, ticket_collected: true },
                        },
                        organizer: {
                            select: {
                                name: true,
                                photo_url: true,
                                id: true,
                                email: true,
                            },
                        },
                        children: {
                            select: {
                                id: true,
                            },
                        },
                    },
                });
            }
            let event = {};
            events.forEach((e) => {
                if (!event[e.state]) {
                    [(event[e.state] = [])];
                }
                e.Participant =
                    e.Participant.length == 0 ? false : e.Participant[0];
                event[e.state].push(e);
            });
            res.json({ error: false, events: event });
        } catch (err) {
            console.log(err);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    } else {
        try {
            let events = [];
            if (req.query.state) {
                events = await prisma.events.findMany({
                    where: {
                        state: {
                            in: req.query.state,
                        },
                        is_only_somaiya: false,
                    },
                    relationLoadStrategy: "join",
                    include: {
                        Participant: {
                            where: {
                                user_id: req.user.id,
                            },
                            select: { attended: true, ticket_collected: true },
                        },
                        organizer: {
                            select: {
                                name: true,
                                photo_url: true,
                                id: true,
                                email: true,
                            },
                        },
                        children: {
                            select: {
                                id: true,
                            },
                        },
                    },
                });
            } else {
                events = await prisma.events.findMany({
                    where: {
                        state: {
                            in: [
                                "UPCOMING",
                                "REGISTRATION_OPEN",
                                "REGISTRATION_CLOSED",
                                "TICKET_OPEN",
                                "TICKET_CLOSED",
                                "ONGOING",
                            ],
                        },
                        is_only_somaiya: false,
                    },
                    relationLoadStrategy: "join",
                    include: {
                        Participant: {
                            where: {
                                user_id: req.user.id,
                            },
                            select: { attended: true, ticket_collected: true },
                        },
                        organizer: {
                            select: {
                                name: true,
                                photo_url: true,
                                id: true,
                                email: true,
                            },
                        },
                        children: {
                            select: {
                                id: true,
                            },
                        },
                    },
                });
            }
            let event = {};
            events.forEach((e) => {
                if (!event[e.state]) {
                    [(event[e.state] = [])];
                }
                console.log("PART:", event.Participant);
                e.Participant =
                    e.Participant.length == 0 ? false : e.Participant[0];
                event[e.state].push(e);
            });
            res.json({ error: false, events: event });
        } catch (err) {
            console.log(err);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    }
});
router.post(protected + "/get/me", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    // events where user has participated
    try {
        let events = await prisma.participant.findMany({
            where: {
                user_id: req.user.id,
            },
            include: {
                event: {
                    include: {
                        organizer: {
                            select: {
                                name: true,
                                photo_url: true,
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        events = events.filter((e) => e.event.state != "PRIVATE");
        res.json({ error: false, events });
    } catch (err) {
        console.error(err);
        return res
            .status(500)
            .json({ error: true, message: "Internal Server Error" });
    }
});
// States that any authenticated (non-privileged) user may view
const PUBLIC_STATES = new Set([
    "UPCOMING",
    "REGISTRATION_OPEN",
    "REGISTRATION_CLOSED",
    "TICKET_OPEN",
    "TICKET_CLOSED",
    "ONGOING",
    "COMPLETED",
]);

router.post(protected + "/get/:id", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    try {
        const eventId = parseInt(req.params.id);
        const denied = await assertCouncilEventAccess(req.user, eventId);
        if (denied) {
            return res.status(denied.status).json({ error: true, message: denied.message });
        }

        let event = await prisma.events.findUnique({
            where: {
                id: eventId,
            },
            include: {
                organizer: {
                    select: {
                        name: true,
                        photo_url: true,
                        id: true,
                        email: true,
                    },
                },
                Participant: {
                    where: {
                        user_id: req.user.id,
                    },
                    select: {
                        ticket_collected: true,
                        id: true,
                        team: {
                            select: {
                                id: true,
                                name: true,
                                leader_id: true,
                                invite_code: true,
                                submissions: true,
                                approved: true,
                                Participant: {
                                    select: {
                                        user: {
                                            select: {
                                                id: true,
                                                name: true,
                                                photo_url: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                children: {
                    select: {
                        id: true,
                    },
                },
                _count: {
                    select: {
                        Participant: {
                            where: { ticket_collected: true },
                        },
                    },
                },
            },
        });

        // Non-privileged users (students) can only view publicly-visible states
        const isPrivileged = ["COUNCIL", "FACULTY", "PRINCIPAL", "ADMIN"].includes(req.user.role);
        if (!isPrivileged && !PUBLIC_STATES.has(event.state)) {
            return res.status(403).json({ error: true, message: "Event not publicly accessible" });
        }

        let eventResponse = {
            id: event.id,
            description: event.description,
            long_description: event.long_description,
            is_only_somaiya: event.is_only_somaiya,
            fee: event.fee,
            tags: event.tags,
            banner_url: event.banner_url,
            logo_image_url: event.logo_image__url,
            event_page_image_url: event.event_page_image_url,
            is_feedback_enabled: event.is_feedback_enabled,
            attendance_type: event.attendance_type,
            registration_type: event.registration_type,
            external_registration_link: event.external_registration_link,
            is_ticket_feature_enabled: event.is_ticket_feature_enabled,
            dates: event.dates,
            venue: event.venue,
            organizer: event.organizer,
            organizer_id: event.organizer_id,
            state: event.state,
            name: event.name,
            tag_line: event.tag_line,
            event_type: event.event_type,
            Participant:
                event.Participant.length == 0 ? false : event.Participant[0],
            start_in_event_activity: event.start_in_event_activity,
            in_event_activity: event.in_event_activity,
            ma_ppt: event.ma_ppt,
            min_ppt: event.min_ppt,
            comment: event.comment,
            parent_id: event.parent_id,
            ticket_count: event.ticket_count,
            tickets_sold: event._count.Participant,
            more_details_enabled: event.more_details_enabled,
            registration_fields: event.registration_fields ?? [],
            is_submission_enabled: event.is_submission_enabled,
            urls: event.urls,
            report_url: event.report_url,
            state_history: event.state_history ?? [],
        };
        res.json({ error: false, event: eventResponse });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "error fetching" });
    }
});
router.post(protected + "/create", authCheck, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    if (req.user.role != "COUNCIL") {
        return res.status(403).json({ error: true, message: "Forbidden" });
    }

    let {
        name,
        tag_line,
        description,
        long_description,
        event_type,
        is_only_somaiya,
        fee,
        tags,
        banner_url,
        logo_image_url,
        event_page_image_url,
        parent_id,
        is_feedback_enabled,
        attendance_type,
        registration_type,
        external_registration_link,
        online_event_link,
        is_ticket_feature_enabled,
        venue,
        dates,
        ma_ppt,
        min_ppt,
        ticket_count,
        report_url,
        urls,
        more_details_enabled,
        is_submission_enabled,
        registration_fields,
        female_requirement,
        in_event_activity,
        start_in_event_activity,
    } = req.body;
    if (dates && dates.length) {
        dates = dates.map((d) => new Date(d));
    }
    const normalizedFields = normalizeRegistrationFields(registration_fields);
    prisma.events
        .create({
            data: {
                name,
                tag_line,
                event_type,
                description,
                long_description,
                is_only_somaiya,
                venue,
                fee,
                tags,
                banner_url,
                logo_image__url: logo_image_url,
                event_page_image_url,
                parent_id,
                is_feedback_enabled,
                attendance_type,
                registration_type,
                external_registration_link,
                online_event_link,
                is_ticket_feature_enabled,
                organizer_id: req.user.id,
                dates,
                state_history: ["DRAFT"],
                ma_ppt,
                min_ppt,
                ticket_count,
                report_url,
                urls,
                more_details_enabled: more_details_enabled ?? false,
                is_submission_enabled: is_submission_enabled ?? false,
                registration_fields: normalizedFields.length ? normalizedFields : undefined,
                female_requirement,
                in_event_activity,
                start_in_event_activity,
            },
        })
        .then((event) => {
            invalidateEvent(event.id, req.user.id);
            res.json({
                error: false,
                message: "Event created successfully",
                event,
            });
        })
        .catch((err) => {
            logger.error(err);
            res.status(500).json({
                error: true,
                message: "Error creating event",
            });
        });
});
router.post(
    protected + "/update/:id",
    authCheck,
    validateUpdateFields,
    async (req, res) => {
        if (!req.user) {
            return res
                .status(401)
                .json({ error: true, message: "Unauthorized" });
        }
        if (
            req.user.role != "COUNCIL" &&
            req.user.role != "FACULTY" &&
            req.user.role != "PRINCIPAL"
        ) {
            return res.status(403).json({ error: true, message: "Forbidden" });
        }
        let state_history = [];
        let state = "";
        try {
            const event = await prisma.events.findUnique({
                where: {
                    id: parseInt(req.params.id),
                },
            });
            state_history = event.state_history;
            state = event.state;
            if (
                event.organizer_id != req.user.id &&
                req.user.role != "FACULTY" &&
                req.user.role != "PRINCIPAL"
            ) {
                return res
                    .status(403)
                    .json({ error: true, message: "Forbidden" });
            }
        } catch (err) {
            console.error(err);
            return res.status(404).json({
                error: true,
                message: "Event not found",
            });
        }

        let field = req.body;

        field.logo_image__url = field.logo_image_url;
        delete field.logo_image_url;

        delete field.organizer;
        delete field.Participant;
        if (field.dates && field.dates.length) {
            field.dates = field.dates.map((d) => new Date(d));
        }
        if (field.registration_fields !== undefined) {
            field.registration_fields = normalizeRegistrationFields(
                field.registration_fields,
            );
        }

        try {
            if (field.state != null && field.state !== state) {
                const role = req.user.role;
                const newState = field.state;

                // Returning to council requires written feedback
                if (
                    (role === "FACULTY" || role === "PRINCIPAL") &&
                    newState === "DRAFT"
                ) {
                    const feedback =
                        field.comment != null ? String(field.comment).trim() : "";
                    if (!feedback) {
                        return res.status(400).json({
                            error: true,
                            message:
                                "Feedback is required when returning an event to council.",
                        });
                    }
                }

                // Faculty: direct approve (UNLISTED) or escalate to Principal
                if (role === "FACULTY" && state === "APPLIED_FOR_APPROVAL") {
                    if (
                        !["APPLIED_FOR_PRINCI_APPROVAL", "UNLISTED", "DRAFT"].includes(
                            newState,
                        )
                    ) {
                        return res.status(400).json({
                            error: true,
                            message: "Invalid faculty approval transition.",
                        });
                    }
                }

                // Principal: final approve or return to council
                if (
                    role === "PRINCIPAL" &&
                    state === "APPLIED_FOR_PRINCI_APPROVAL"
                ) {
                    if (!["UNLISTED", "DRAFT"].includes(newState)) {
                        return res.status(400).json({
                            error: true,
                            message: "Invalid principal approval transition.",
                        });
                    }
                }

                // Council: submit or resubmit proposal from draft
                if (
                    role === "COUNCIL" &&
                    state === "DRAFT" &&
                    newState === "APPLIED_FOR_APPROVAL"
                ) {
                    field.comment = null;
                }

                // Clear reviewer feedback on forward/approve (not on return-to-draft)
                if (
                    (role === "FACULTY" || role === "PRINCIPAL") &&
                    (newState === "UNLISTED" ||
                        newState === "APPLIED_FOR_PRINCI_APPROVAL")
                ) {
                    field.comment = null;
                }

                state_history.push(newState);
                field.state_history = state_history;
            }
            await prisma.events.update({
                where: {
                    id: parseInt(req.params.id),
                },
                data: field,
            });
            invalidateEvent(parseInt(req.params.id), req.user.id);
            res.json({
                error: false,
                message: "Event updated successfully",
            });
        } catch (err) {
            console.error(err);
            logger.error(err);
            return res.status(500).json({
                error: true,
                message: "Error updating event",
            });
        }
    },
);
router.get(protected + "/search/", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }

    let { q } = req.query;
    if (q == null || q.length == 0) {
        return res
            .status(400)
            .json({ error: true, message: "Invalid search query" });
    }
    try {
        let events = await prisma.events.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                    { long_description: { contains: q, mode: "insensitive" } },
                    { tag_line: { contains: q, mode: "insensitive" } },
                    { tags: { hasSome: [q] } },
                ],
            },
            orderBy: {
                created_at: "desc",
            },
            take: 20,
            select: {
                id: true,
                name: true,
                tag_line: true,
                description: true,
                banner_url: true,
                logo_image__url: true,
                event_page_image_url: true,
                venue: true,
                state: true,
                event_type: true,
                fee: true,
                dates: true,
                is_only_somaiya: true,
                registration_type: true,
                organizer: {
                    select: {
                        id: true,
                        name: true,
                        photo_url: true,
                    },
                },
            },
        });
        res.json({ error: false, events });
    } catch (er) {
        console.error(er);
        return res
            .status(500)
            .json({ error: true, message: "Internal Server Error" });
    }
});
router.get(protected + "/stats", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }

    const cacheKey =
        req.user.role === "COUNCIL"
            ? cKeys.stats(req.user.id)
            : cKeys.stats();
    const cached = cGet(cacheKey);
    if (cached) return res.json(cached);

    try {
        const eventsStats = await prisma.events.findMany({
            where:
                req.user.role === "COUNCIL"
                    ? { organizer_id: req.user.id }
                    : undefined,
            select: {
                id: true,
                name: true,
                organizer_id: true,
                dates: true,
                Participant: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                year: true,
                                branch: true,
                                gender: true,
                            },
                        },
                    },
                },
            },
        });

        const result = eventsStats.map((event) => {
            const totalParticipants = event.Participant.length;

            const yearStats = {};
            const branchStats = {};
            const genderStats = {};

            event.Participant.forEach((participant) => {
                const { year, branch, gender } = participant.user || {};

                // Count year
                if (year) {
                    yearStats[year] = (yearStats[year] || 0) + 1;
                }

                // Count branch
                if (branch) {
                    branchStats[branch] = (branchStats[branch] || 0) + 1;
                }

                // Count gender
                if (gender) {
                    genderStats[gender] = (genderStats[gender] || 0) + 1;
                }
            });

            return {
                eventId: event.id,
                eventName: event.name,
                organizerId: event.organizer_id,
                dates: event.dates,
                totalParticipants,
                yearStats,
                branchStats,
                genderStats,
            };
        });

        const payload = { error: false, data: result };
        cSet(cacheKey, payload, TTL.STATS);
        return res.json(payload);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: true,
            message: "Error fetching event stats",
        });
    }
});
router.post(protected + "/get-children/:id", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    const parentId = parseInt(req.params.id);
    if (isNaN(parentId)) {
        return res.status(400).json({ error: true, message: "Invalid event id" });
    }

    const isPrivileged = ["COUNCIL", "FACULTY", "PRINCIPAL", "ADMIN"].includes(req.user.role);

    try {
        // For COUNCIL: verify they own the parent event before showing its children
        if (req.user.role === "COUNCIL") {
            const denied = await assertCouncilEventAccess(req.user, parentId);
            if (denied) {
                return res.status(denied.status).json({ error: true, message: denied.message });
            }
        }

        const childWhere = { parent_id: parentId };
        // Non-privileged users only see publicly visible children
        if (!isPrivileged) {
            childWhere.state = { in: [...PUBLIC_STATES] };
        }

        const children = await prisma.events.findMany({
            where: childWhere,
            include: {
                organizer: {
                    select: { id: true, name: true, photo_url: true, email: true },
                },
            },
        });
        return res.json({ error: false, children });
    } catch (err) {
        logger.error(err);
        return res
            .status(500)
            .json({ error: true, message: "Error fetching child events" });
    }
});

router.post(protected + "/get-calendar", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    const role = req.user.role;

    // COUNCIL users see their own events in all states (for planning),
    // plus other councils' publicly-visible events.
    // Faculty / Principal see all publicly-visible events across all councils.
    // Students see only publicly-visible events (excluding COMPLETED for cleanliness).
    const publicCalendarStates = [
        "UPCOMING",
        "REGISTRATION_OPEN",
        "REGISTRATION_CLOSED",
        "TICKET_OPEN",
        "TICKET_CLOSED",
        "ONGOING",
        "COMPLETED",
    ];
    const studentCalendarStates = [
        "UPCOMING",
        "REGISTRATION_OPEN",
        "REGISTRATION_CLOSED",
        "TICKET_OPEN",
        "TICKET_CLOSED",
        "ONGOING",
    ];

    try {
        let whereClause;
        if (role === "COUNCIL") {
            // Show this council's own events (any state) OR other councils' public events
            whereClause = {
                OR: [
                    { organizer_id: req.user.id },
                    { state: { in: publicCalendarStates } },
                ],
            };
        } else if (role === "FACULTY" || role === "PRINCIPAL") {
            whereClause = { state: { in: publicCalendarStates } };
        } else {
            whereClause = { state: { in: studentCalendarStates } };
        }

        const events = await prisma.events.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                tag_line: true,
                dates: true,
                venue: true,
                state: true,
                banner_url: true,
                logo_image__url: true,
                event_type: true,
                organizer: {
                    select: { id: true, name: true, photo_url: true },
                },
            },
            orderBy: { dates: "asc" },
        });
        return res.json({ error: false, events });
    } catch (err) {
        logger.error(err);
        return res
            .status(500)
            .json({ error: true, message: "Error fetching calendar events" });
    }
});
router.post(protected + "/register-for-event", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }

    let { event_id, more_details } = req.body;
    let event = null;
    try {
        event = await prisma.events.findUnique({
            where: {
                id: parseInt(event_id),
            },
        });
    } catch (err) {
        logger.error(err);
        return res
            .status(500)
            .json({ error: true, message: "Error fetching event" });
    }

    try {
        await prisma.participant.findFirstOrThrow({
            where: {
                user_id: req.user.id,
                event_id: parseInt(event_id),
            },
        });
        return res.status(400).json({
            error: true,
            message: "User already registered for this event",
        });
    } catch (e) {
        if (event.ma_ppt > 1) {
            return res.status(403).json({
                error: true,
                message: "use /create-team to register for this event",
            });
        }
        if (!req.user.is_somaiya_student && event.is_only_somaiya) {
            return res.status(403).json({
                error: true,
                message:
                    "Only Somaiya participants are allowed to register for this event",
            });
        }
        if (event.state !== "REGISTRATION_OPEN") {
            return res.status(403).json({
                error: true,
                message: "Registrations are not open.",
            });
        }
        const detailsCheck = validateMoreDetails(event, more_details);
        if (!detailsCheck.ok) {
            return res.status(400).json({
                error: true,
                message: detailsCheck.message,
            });
        }
        try {
            await prisma.participant.create({
                data: {
                    event_id: parseInt(event_id),
                    user_id: req.user.id,
                    amount: event.fee,
                    payment_status: event.fee == 0 ? "SUCCESS" : "PENDING",
                    more_details: more_details,
                },
            });
            res.json({
                error: false,
                message: "Registration successful",
            });
        } catch (err) {
            logger.error(err);
            return res.status(500).json({
                error: true,
                message: "Error registering for event",
            });
        }
    }
});
router.post(protected + "/create-team", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    let { event_id, team_name, more_details } = req.body;
    let event = null;
    try {
        event = await prisma.events.findUnique({
            where: {
                id: parseInt(event_id),
            },
        });
    } catch (err) {
        logger.error(err);
        return res
            .status(500)
            .json({ error: true, message: "Error fetching event" });
    }

    try {
        await prisma.participant.findFirstOrThrow({
            where: {
                user_id: req.user.id,
                event_id: parseInt(event_id),
            },
        });
        return res.status(400).json({
            error: true,
            message: "User already registered for this event",
        });
    } catch (e) {}

    if (event.ma_ppt == 1) {
        return res.status(403).json({
            error: true,
            message: "This is not a team event",
        });
    }

    if (!req.user.is_somaiya_student && event.is_only_somaiya) {
        return res.status(403).json({
            error: true,
            message:
                "Only Somaiya participants are allowed to register for this event",
        });
    }

    if (event.state !== "REGISTRATION_OPEN") {
        return res.status(403).json({
            error: true,
            message: "Registrations are not open.",
        });
    }
    const createTeamDetailsCheck = validateMoreDetails(event, more_details);
    if (!createTeamDetailsCheck.ok) {
        return res.status(400).json({
            error: true,
            message: createTeamDetailsCheck.message,
        });
    }
    const maxRetries = 5;
    let retries = 0;
    let team = null;
    while (retries < maxRetries) {
        let inviteCode = generateRandomCode();
        console.log({
            name: team_name,
            event_id: parseInt(event_id),
            leader_id: req.user.id,
            invite_code: inviteCode,
        });
        try {
            team = await prisma.team.create({
                data: {
                    name: team_name,
                    event_id: parseInt(event_id),
                    leader_id: req.user.id,
                    invite_code: inviteCode,
                },
            });
            break;
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002" &&
                error.meta?.target?.includes("invite_code")
            ) {
                // unique constraint failed for the invite code, retry
                retries++;
                console.warn(
                    `Retrying due to invite code collision: ${inviteCode}`,
                );
            } else if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002" &&
                error.meta?.target?.includes("name")
            ) {
                return res.status(400).json({
                    error: true,
                    message: "Team name already exists",
                });
            } else {
                logger.error(error);
                return res.status(500).json({
                    error: true,
                    message: "Error creating team",
                });
            }
        }
    }
    try {
        await prisma.participant.create({
            data: {
                event_id: parseInt(event_id),
                user_id: req.user.id,
                team_id: team.id,
                amount: event.fee,
                payment_status: event.fee == 0 ? "SUCCESS" : "PENDING",
                more_details: more_details,
            },
        });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            error: true,
            message: "Error joining team",
        });
    }
    res.json({
        error: false,
        message: "Team created successfully",
        team,
    });
    try {
        await sendMail(
            req.user.email,
            "Team Creation Details",
            team.name,
            team.invite_code,
        );
        console.log("Email sent successfully");
    } catch (err) {
        logger.error(err);
        console.log("Error sending email");
    }
});
router.post(protected + "/join-team", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    let { event_id, invite_code, more_details } = req.body;
    let event = null;
    try {
        event = await prisma.events.findUnique({
            where: {
                id: parseInt(event_id),
            },
        });
    } catch (err) {
        logger.error(err);
        return res
            .status(500)
            .json({ error: true, message: "Error fetching event" });
    }

    try {
        await prisma.participant.findFirstOrThrow({
            where: {
                user_id: req.user.id,
                event_id: parseInt(event_id),
            },
        });
        return res.status(400).json({
            error: true,
            message: "User already registered for this event",
        });
    } catch (e) {}

    if (event.ma_ppt == 1) {
        return res.status(403).json({
            error: true,
            message: "This is not a team event",
        });
    }

    if (!req.user.is_somaiya_student && event.is_only_somaiya) {
        return res.status(403).json({
            error: true,
            message:
                "Only Somaiya participants are allowed to register for this event",
        });
    }

    if (event.state !== "REGISTRATION_OPEN") {
        return res.status(403).json({
            error: true,
            message: "Registrations are not open.",
        });
    }

    const joinTeamDetailsCheck = validateMoreDetails(event, more_details);
    if (!joinTeamDetailsCheck.ok) {
        return res.status(400).json({
            error: true,
            message: joinTeamDetailsCheck.message,
        });
    }

    let team = null;
    try {
        team = await prisma.team.findFirstOrThrow({
            where: {
                AND: [
                    {
                        event_id: parseInt(event_id),
                    },
                    {
                        invite_code: invite_code,
                    },
                ],
            },
        });
    } catch (err) {
        return res.status(404).json({ error: true, message: "Team not found" });
    }

    // count the number of participants in the team
    let participants = await prisma.participant.findMany({
        where: {
            AND: [
                {
                    event_id: parseInt(event_id),
                },
                {
                    team_id: team.id,
                },
            ],
        },
        include: { user: { select: { gender: true } } },
    });

    let teamMembers = participants.length;

    if (teamMembers >= event.ma_ppt) {
        return res.status(403).json({
            error: true,
            message: "Team is full",
        });
    }

    // count the number of female participants in the team
    let femaleParticipants = participants.filter(
        (participant) => participant.user?.gender === "FEMALE",
    ).length;

    if (
        req.user.gender === "MALE" &&
        femaleParticipants < event.female_requirement &&
        teamMembers + 1 >= event.ma_ppt
    ) {
        return res.status(403).json({
            error: true,
            message:
                "Female requirements not met and no additional space for female participants",
        });
    }

    try {
        await prisma.participant.create({
            data: {
                event_id: parseInt(event_id),
                user_id: req.user.id,
                team_id: team.id,
                amount: event.fee,
                payment_status: event.fee == 0 ? "SUCCESS" : "PENDING",
                more_details: more_details,
            },
        });
        res.json({
            error: false,
            message: "Joined team successfully",
            team,
        });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            error: true,
            message: "Error joining team",
        });
    }
});
router.post(protected + "/delete-team", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    let { event_id, team_id } = req.body;
    let event = null;
    try {
        event = await prisma.events.findUniqueOrThrow({
            where: {
                id: parseInt(event_id),
            },
        });
    } catch (err) {
        logger.error(err);
        return res
            .status(500)
            .json({ error: true, message: "Error fetching team" });
    }

    if (event.state !== "REGISTRATION_OPEN") {
        return res.status(403).json({
            error: true,
            message: "Registrations are not open. Cannot delete team",
        });
    }

    try {
        await prisma.team.delete({
            where: {
                id: parseInt(team_id),
                leader_id: req.user.id,
            },
        });
        res.json({
            error: false,
            message: "Team deleted successfully",
        });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            error: true,
            message: "Error deleting team",
        });
    }
});
router.post(protected + "/remove-from-team", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    let { team_id, user_id } = req.body;
    console.log(req.user.id, team_id, user_id);
    let team = null;
    try {
        team = await prisma.team.findUniqueOrThrow({
            where: {
                id: parseInt(team_id),
            },
            include: {
                event: true,
            },
        });
    } catch (err) {
        logger.error(err);
        return res
            .status(500)
            .json({ error: true, message: "Error fetching team" });
    }

    if (team.event.state !== "REGISTRATION_OPEN") {
        return res.status(403).json({
            error: true,
            message: "Registrations are not open. Cannot delete team",
        });
    }

    if (team.leader_id === user_id) {
        return res.status(403).json({
            error: true,
            message: "Leader cannot be removed from the team",
        });
    }

    if (req.user.id !== team.leader_id && req.user.id !== user_id) {
        return res.status(403).json({
            error: true,
            message: "Not authorized to remove user from team",
        });
    }

    try {
        await prisma.participant.deleteMany({
            where: {
                AND: [
                    {
                        team_id: parseInt(team_id),
                    },
                    {
                        user_id: parseInt(user_id),
                    },
                ],
            },
        });
        res.json({
            error: false,
            message: "User Removed successfully",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: true,
            message: "Error deleting team",
        });
    }
});
router.post(protected + "/team-submission", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    let { team_id, submissions } = req.body;
    let team = null;
    try {
        team = await prisma.team.findUniqueOrThrow({
            where: {
                id: parseInt(team_id),
            },
            include: {
                event: true,
                Participant: {
                    include: {
                        user: true, // Include user data for each participant
                    },
                },
                leader: true, // Include leader data
            },
        });
    } catch (err) {
        logger.error(err);
        console.error(err);
        return res
            .status(500)
            .json({ error: true, message: "Error fetching team" });
    }

    // Check if the team has the minimum required participants
    if (team.Participant.length < team.event.min_ppt) {
        return res.status(403).json({
            error: true,
            message: `Team must have at least ${team.event.min_ppt} participants to submit`,
        });
    }
    if (team.leader_id !== req.user.id) {
        return res.status(403).json({
            error: true,
            message: "Not authorized to submit for team",
        });
    }
    try {
        await prisma.team.update({
            where: {
                id: parseInt(team_id),
            },
            data: {
                submissions,
            },
        });
        res.json({
            error: false,
            message: "Submission updated successfully",
        });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            error: true,
            message: "Error updating submission",
        });
    }
    try {
        const { ppt, video, consent, acceptance } = submissions;
        await fetch(
            "https://flask-google-sheet-appguni.onrender.com/add-team-data",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    team_id: team_id,
                    team_name: team.name,
                    submission_ppt: ppt,
                    submission_video: video,
                    consent: consent,
                    submission_acceptance: acceptance,
                    leader_id: team.leader_id,
                    participant1_name: team.Participant[0]?.user?.name || "",
                    participant1_email: team.Participant[0]?.user?.email || "",
                    more_details1: team.Participant[0]?.more_details || "",
                    participant2_name: team.Participant[1]?.user?.name || "",
                    participant2_email: team.Participant[1]?.user?.email || "",
                    more_details2: team.Participant[1]?.more_details || "",
                    participant3_name: team.Participant[2]?.user?.name || "",
                    participant3_email: team.Participant[2]?.user?.email || "",
                    more_details3: team.Participant[2]?.more_details || "",
                    participant4_name: team.Participant[3]?.user?.name || "",
                    participant4_email: team.Participant[3]?.user?.email || "",
                    more_details4: team.Participant[3]?.more_details || "",
                    team_approval: team.approved,
                }),
            },
        );
        console.log("User and team details pushed successfully");
    } catch (err) {
        logger.error(err);
        console.log("Error pushing user and team details");
    }
});
router.post(protected + "/rate", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    let { event_id, rating } = req.body;
    if (rating < 1 || rating > 5) {
        return res
            .status(400)
            .json({ error: true, message: "Invalid rating value" });
    }
    try {
        await prisma.events.findUnique({
            where: {
                id: parseInt(event_id),
            },
        });
    } catch (err) {
        logger.error(err);
        return res
            .status(500)
            .json({ error: true, message: "Error fetching event" });
    }
    let participant = null;
    try {
        console.log(req.user.id, event_id);
        participant = await prisma.participant.findFirstOrThrow({
            where: {
                user_id: req.user.id,
                event_id: parseInt(event_id),
            },
        });
    } catch (e) {
        console.error(e);
        return res.status(400).json({
            error: true,
            message: "User hasn't registered for this event",
        });
    }

    try {
        await prisma.participant.update({
            where: {
                id: participant.id,
            },
            data: {
                rating,
            },
        });
        res.json({
            error: false,
            message: "Rating updated successfully",
        });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            error: true,
            message: "Error updating rating",
        });
    }
});
router.post(protected + "/claim-ticket", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    let { event_id } = req.body;
    let event = null;
    try {
        event = await prisma.events.findUnique({
            where: {
                id: parseInt(event_id),
            },
        });
    } catch (err) {
        logger.error(err);
        return res
            .status(500)
            .json({ error: true, message: "Error fetching event" });
    }
    let participant = null;
    try {
        participant = await prisma.participant.findFirstOrThrow({
            where: {
                user_id: req.user.id,
                event_id: parseInt(event_id),
            },
        });
    } catch (e) {
        return res.status(400).json({
            error: true,
            message: "User hasn't registered for this event",
        });
    }
    if (!event.is_ticket_feature_enabled) {
        return res.status(400).json({
            error: true,
            message: "Ticket feature not enabled for this event",
        });
    }
    if (participant.ticket_collected) {
        return res.status(400).json({
            error: true,
            message: "Ticket already collected",
        });
    }
    const count = await prisma.participant.count({
        where: {
            event_id: parseInt(event_id),
            ticket_collected: true,
        },
    });

    if (count >= event.ticket_count) {
        return res.status(400).json({
            error: true,
            message: "Tickets are sold out",
        });
    }

    try {
        await prisma.participant.update({
            where: {
                id: participant.id,
            },
            data: {
                ticket_collected: true,
            },
        });
        res.json({
            error: false,
            message: "Ticket claimed successfully",
        });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            error: true,
            message: "Error claiming ticket",
        });
    }
});
router.get("/get-event-participants/:id", authCheck, async (req, res) => {
    let { id } = req.params;
    const eventId = parseInt(id);
    const denied = await assertCouncilEventAccess(req.user, eventId);
    if (denied) {
        return res.status(denied.status).json({ error: true, message: denied.message });
    }
    try {
        let teams = await prisma.team.findMany({
            where: {
                event_id: eventId,
            },
            include: {
                Participant: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        // Ensure each participant has a user object
        teams = teams.map((team) => ({
            ...team,
            Participant: team.Participant.map((participant) => ({
                ...participant,
                user: participant.user || {},
            })),
        }));

        const soloParticipants = await prisma.participant.findMany({
            where: { event_id: eventId, team_id: null },
            include: { user: true },
        });

        if (soloParticipants.length > 0) {
            teams.push({
                id: 0,
                name: "Individual",
                leader_id: 0,
                event_id: eventId,
                invite_code: "",
                approved: true,
                submissions: null,
                Participant: soloParticipants.map((participant) => ({
                    ...participant,
                    user: participant.user || {},
                })),
            });
        }

        res.json({ error: false, teams });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: true,
            message: "Error fetching participants",
        });
    }
});

router.post("/checkin", authCheck, async (req, res) => {
    try {
        let { event_id, participant_id } = req.body;

        event_id = parseInt(event_id);
        participant_id = parseInt(participant_id);

        if (isNaN(event_id) || isNaN(participant_id)) {
            return res.status(400).json({
                error: true,
                message: "Invalid event_id or participant_id",
            });
        }

        const denied = await assertCouncilEventAccess(req.user, event_id);
        if (denied) {
            return res.status(denied.status).json({ error: true, message: denied.message });
        }

        const participant_attendend = await prisma.participant.update({
            where: {
                id: participant_id,
                event_id,
            },
            data: {
                attended: true,
            },
        });

        if (!participant_attendend) {
            return res.status(404).json({
                error: true,
                message: "Participant not found for the given event",
            });
        }

        return res.json({
            error: false,
            participant_attendend,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: true,
            message: "Error checking in",
        });
    }
});

router.post("/uncheckin", authCheck, async (req, res) => {
    try {
        let { event_id, participant_id } = req.body;

        event_id = parseInt(event_id);
        participant_id = parseInt(participant_id);

        if (isNaN(event_id) || isNaN(participant_id)) {
            return res.status(400).json({
                error: true,
                message: "Invalid event_id or participant_id",
            });
        }

        const denied = await assertCouncilEventAccess(req.user, event_id);
        if (denied) {
            return res.status(denied.status).json({ error: true, message: denied.message });
        }

        const participant = await prisma.participant.update({
            where: { id: participant_id, event_id },
            data: { attended: false },
        });

        return res.json({ error: false, participant });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Error reverting check-in" });
    }
});

// ── Council bulk controls ───────────────────────────────────────────────────

/**
 * POST /p/bulk-issue-tickets
 * Body: { event_id, count? }
 * Mark ticket_collected = true for the first `count` participants
 * (ordered by registered_on). Defaults to ALL eligible participants.
 * Only marks participants whose payment_status is SUCCESS or MANUAL.
 */
router.post(protected + "/bulk-issue-tickets", authCheck, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: true, message: "Unauthorized" });
    const eventId = parseInt(req.body.event_id);
    const count = req.body.count ? parseInt(req.body.count) : undefined;
    if (isNaN(eventId)) return res.status(400).json({ error: true, message: "Invalid event_id" });

    const denied = await assertCouncilEventAccess(req.user, eventId);
    if (denied) return res.status(denied.status).json({ error: true, message: denied.message });

    try {
        // Find eligible participants (paid, ticket not yet collected), ordered by registration date
        const eligible = await prisma.participant.findMany({
            where: {
                event_id: eventId,
                ticket_collected: false,
                payment_status: { in: ["SUCCESS", "MANUAL"] },
            },
            orderBy: { registered_on: "asc" },
            take: count,
            select: { id: true },
        });

        const ids = eligible.map((p) => p.id);
        const { count: issued } = await prisma.participant.updateMany({
            where: { id: { in: ids } },
            data: { ticket_collected: true },
        });

        invalidateEvent(eventId, req.user.id);
        return res.json({ error: false, issued, message: `Issued ${issued} ticket(s)` });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ error: true, message: "Error issuing tickets" });
    }
});

/**
 * POST /p/bulk-mark-paid
 * Body: { event_id, count?, participant_ids? }
 * Mark payment_status = MANUAL for first `count` PENDING participants
 * OR for a specific list of participant_ids.
 */
router.post(protected + "/bulk-mark-paid", authCheck, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: true, message: "Unauthorized" });
    const eventId = parseInt(req.body.event_id);
    const count = req.body.count ? parseInt(req.body.count) : undefined;
    const participantIds = Array.isArray(req.body.participant_ids)
        ? req.body.participant_ids.map(Number)
        : null;

    if (isNaN(eventId)) return res.status(400).json({ error: true, message: "Invalid event_id" });

    const denied = await assertCouncilEventAccess(req.user, eventId);
    if (denied) return res.status(denied.status).json({ error: true, message: denied.message });

    try {
        let ids;
        if (participantIds && participantIds.length > 0) {
            ids = participantIds;
        } else {
            const pending = await prisma.participant.findMany({
                where: { event_id: eventId, payment_status: "PENDING" },
                orderBy: { registered_on: "asc" },
                take: count,
                select: { id: true },
            });
            ids = pending.map((p) => p.id);
        }

        const { count: updated } = await prisma.participant.updateMany({
            where: { id: { in: ids }, event_id: eventId },
            data: { payment_status: "MANUAL" },
        });

        invalidateEvent(eventId, req.user.id);
        return res.json({ error: false, updated, message: `Marked ${updated} participant(s) as paid` });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ error: true, message: "Error marking participants as paid" });
    }
});

/**
 * GET /p/event-stats/:id
 * Quick stats for the controls panel:
 * total registered, payment breakdown, tickets claimed, attended count.
 */
router.get(protected + "/event-stats/:id", authCheck, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: true, message: "Unauthorized" });
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) return res.status(400).json({ error: true, message: "Invalid id" });

    const denied = await assertCouncilEventAccess(req.user, eventId);
    if (denied) return res.status(denied.status).json({ error: true, message: denied.message });

    try {
        const [event, total, paid, ticketed, attended] = await Promise.all([
            prisma.events.findUnique({ where: { id: eventId }, select: { ticket_count: true, state: true, is_ticket_feature_enabled: true, fee: true } }),
            prisma.participant.count({ where: { event_id: eventId } }),
            prisma.participant.count({ where: { event_id: eventId, payment_status: { in: ["SUCCESS", "MANUAL"] } } }),
            prisma.participant.count({ where: { event_id: eventId, ticket_collected: true } }),
            prisma.participant.count({ where: { event_id: eventId, attended: true } }),
        ]);
        return res.json({ error: false, stats: { total, paid, pending: total - paid, ticketed, attended, ticket_count: event?.ticket_count ?? null } });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ error: true, message: "Error fetching stats" });
    }
});

/**
 * GET /p/export-participants/:id
 * Returns a CSV of all participants for the event.
 */
router.get(protected + "/export-participants/:id", authCheck, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: true, message: "Unauthorized" });
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) return res.status(400).json({ error: true, message: "Invalid id" });

    const denied = await assertCouncilEventAccess(req.user, eventId);
    if (denied) return res.status(denied.status).json({ error: true, message: denied.message });

    try {
        const [event, participants] = await Promise.all([
            prisma.events.findUnique({ where: { id: eventId }, select: { name: true } }),
            prisma.participant.findMany({
                where: { event_id: eventId },
                include: {
                    user: { select: { name: true, email: true, roll_number: true, branch: true, year: true, phone_number: true, gender: true } },
                    team: { select: { name: true } },
                },
                orderBy: { registered_on: "asc" },
            }),
        ]);

        const header = "Name,Email,Roll Number,Branch,Year,Gender,Phone,Team,Payment Status,Ticket Collected,Attended,Registered On";
        const rows = participants.map((p) => {
            const u = p.user || {};
            return [
                `"${u.name || ""}"`, `"${u.email || ""}"`, `"${u.roll_number || ""}"`,
                `"${u.branch || ""}"`, u.year || "", `"${u.gender || ""}"`,
                `"${u.phone_number || ""}"`, `"${p.team?.name || "Individual"}"`,
                p.payment_status, p.ticket_collected ? "Yes" : "No",
                p.attended ? "Yes" : "No",
                new Date(p.registered_on).toLocaleDateString("en-IN"),
            ].join(",");
        });

        const csv = [header, ...rows].join("\n");
        const filename = `${(event?.name || "event").replace(/\s+/g, "_")}-participants.csv`;
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        return res.send(csv);
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ error: true, message: "Error exporting participants" });
    }
});

router.get(
    protected + "/attendance-report/:id",
    authCheck,
    async (req, res) => {
        if (
            !req.user ||
            !["COUNCIL", "FACULTY", "PRINCIPAL"].includes(req.user.role)
        ) {
            return res.status(403).json({ error: true, message: "Forbidden" });
        }

        try {
            const eventId = parseInt(req.params.id);

            const denied = await assertCouncilEventAccess(req.user, eventId);
            if (denied) {
                return res.status(denied.status).json({ error: true, message: denied.message });
            }

            const event = await prisma.events.findUnique({
                where: { id: eventId },
                select: { name: true },
            });

            const participants = await prisma.participant.findMany({
                where: { event_id: eventId, ticket_collected: true },
                include: {
                    user: {
                        select: {
                            name: true,
                            roll_number: true,
                            branch: true,
                            year: true,
                            signature: true,
                        },
                    },
                },
                orderBy: [
                    {
                        user: {
                            year: "asc",
                        },
                    },
                    {
                        user: {
                            branch: "asc",
                        },
                    },
                    {
                        user: {
                            roll_number: "asc",
                        },
                    },
                ],
            });

            const doc = new PDFDocument({ size: "A4", margin: 40 });
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${event.name}-attendance.pdf"`,
            );

            doc.pipe(res);

            doc.fontSize(16).text(`Attendance Report – ${event.name}`, {
                align: "center",
            });
            doc.moveDown();

            // Table layout
            const colWidths = {
                roll: 75,
                name: 150,
                branch: 100,
                year: 75,
                signature: 100,
            };

            const rowHeight = 20;
            const tableLeft = 40;
            const tableRight =
                tableLeft + Object.values(colWidths).reduce((a, b) => a + b, 0);
            const tableTop = doc.y + 10;
            let y = tableTop + rowHeight / 2 - 5;

            // Draw table headers
            doc.font("Helvetica-Bold")
                .fontSize(10)
                .text("Roll No", tableLeft, y, {
                    width: colWidths.roll,
                    align: "center",
                })
                .text("Name", tableLeft + colWidths.roll, y, {
                    width: colWidths.name,
                    align: "center",
                })
                .text(
                    "Branch",
                    tableLeft + colWidths.roll + colWidths.name,
                    y,
                    {
                        width: colWidths.branch,
                        align: "center",
                    },
                )
                .text(
                    "Year",
                    tableLeft +
                        colWidths.roll +
                        colWidths.name +
                        colWidths.branch,
                    y,
                    {
                        width: colWidths.year,
                        align: "center",
                    },
                )
                .text(
                    "Signature",
                    tableLeft +
                        colWidths.roll +
                        colWidths.name +
                        colWidths.branch +
                        colWidths.year,
                    y,
                    { width: colWidths.signature, align: "center" },
                );

            y += 20;
            doc.moveTo(tableLeft, y).lineTo(tableRight, y).stroke();

            // Header vertical lines
            let x = tableLeft;
            for (const width of Object.values(colWidths)) {
                doc.moveTo(x, tableTop).lineTo(x, y).stroke();
                x += width;
            }
            doc.moveTo(x, tableTop).lineTo(x, y).stroke(); // final right border

            // Table rows
            let rowIndex = 0;
            for (const p of participants) {
                if (y + rowHeight > 780) {
                    doc.addPage();
                    y = 40;
                }

                const { name, roll_number, branch, year, signature } = p.user;
                const centerTextY = y + rowHeight / 2 - 5;

                // Alternating background
                if (rowIndex % 2 === 0) {
                    doc.rect(tableLeft, y, tableRight - tableLeft, rowHeight)
                        .fillColor("#f2f2f2")
                        .fill();
                }
                doc.fillColor("black"); // reset fill color for text/strokes

                // Text Columns
                doc.font("Helvetica")
                    .fontSize(9)
                    .text(roll_number || "N/A", tableLeft, centerTextY, {
                        width: colWidths.roll,
                        align: "center",
                    })
                    .text(
                        name || "N/A",
                        tableLeft + colWidths.roll,
                        centerTextY,
                        {
                            width: colWidths.name,
                            align: "center",
                        },
                    )
                    .text(
                        branch || "N/A",
                        tableLeft + colWidths.roll + colWidths.name,
                        centerTextY,
                        {
                            width: colWidths.branch,
                            align: "center",
                        },
                    )
                    .text(
                        year || "N/A",
                        tableLeft +
                            colWidths.roll +
                            colWidths.name +
                            colWidths.branch,
                        centerTextY,
                        {
                            width: colWidths.year,
                            align: "center",
                        },
                    );

                // Signature box
                if (signature && Array.isArray(signature)) {
                    doc.save();

                    const sigX =
                        tableLeft +
                        colWidths.roll +
                        colWidths.name +
                        colWidths.branch +
                        colWidths.year +
                        30;
                    const sigY = y + 5;

                    const scale = 0.125;
                    doc.translate(sigX, sigY);

                    for (const stroke of signature) {
                        if (!stroke.length) continue;
                        doc.moveTo(stroke[0].x * scale, stroke[0].y * scale);
                        for (let i = 1; i < stroke.length; i++) {
                            doc.lineTo(
                                stroke[i].x * scale,
                                stroke[i].y * scale,
                            );
                        }
                        doc.stroke();
                    }

                    doc.restore();
                } else {
                    doc.text(
                        "No signature",
                        tableLeft +
                            colWidths.roll +
                            colWidths.name +
                            colWidths.branch +
                            colWidths.year +
                            10,
                        centerTextY,
                    );
                }

                // Row horizontal line
                y += rowHeight;
                doc.moveTo(tableLeft, y).lineTo(tableRight, y).stroke();

                // Vertical column lines
                x = tableLeft;
                for (const width of Object.values(colWidths)) {
                    doc.moveTo(x, y - rowHeight)
                        .lineTo(x, y)
                        .stroke();
                    x += width;
                }
                doc.moveTo(x, y - rowHeight)
                    .lineTo(x, y)
                    .stroke();

                rowIndex++;
            }

            // Outer border
            const totalHeight = y - tableTop;
            doc.rect(
                tableLeft,
                tableTop,
                tableRight - tableLeft,
                totalHeight,
            ).stroke();

            doc.end();
        } catch (err) {
            console.error("PDF generation error:", err);
            res.status(500).json({
                error: true,
                message: "Failed to generate PDF",
            });
        }
    },
);

module.exports = router;
