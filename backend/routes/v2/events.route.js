const express = require("express");
const authCheck = require("../../middleware/auth.middleware");
const prisma = require("../../utils/prisma_client");
const logger = require("../../utils/logger");
const validateUpdateFields = require("../../middleware/field-validator.middlware");

const router = express.Router();
router.use(authCheck);

router.get("/", async (req, res) => {
    console.log(req.query);
    let where = {};
    if (req.user.role === "COUNCIL") {
        where = {
            OR: [
                { organizer_id: req.user.id },
                {
                    state: {
                        in: [
                            "UPCOMING",
                            "REGISTRATION_OPEN",
                            "REGISTRATION_CLOSED",
                            "TICKET_OPEN",
                            "TICKET_CLOSED",
                            "ONGOING",
                            "COMPLETED",
                        ],
                    },
                },
            ],
        };
    } else if (req.user.role === "FACULTY") {
        where = {
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
                ],
            },
        };
    } else if (req.user.is_somaiya_student) {
        where = {
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
        };
    } else {
        where = {
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
        };
    }
    try {
        let events = [];
        events = await prisma.events.findMany({
            where,
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
            },
        });
        return res.json({
            error: false,
            events,
            message: "Events fetched successfully",
        });
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({ error: true, message: "Internal Server Error" });
    }
});
router.post("/", (req, res) => {
    if (req.user.role != "COUNCIL") {
        return res.status(403).json({ error: true, message: "Forbidden" });
    }

    if (req.body.is_parent) {
        let {
            name,
            title,
            tag_line,
            description,
            long_description,
            event_type,
            banner_url,
            logo_image_url,
            event_page_image_url,
            dates,
            tags,
            is_only_somaiya,
            fee,
        } = req.body;
    } else {
        let {
            name,
            title,
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
            is_feedback_enabled,
            attendance_type,
            registration_type,
            external_registration_link,
            is_ticket_feature_enabled,
            venue,
            dates,
        } = req.body;
        if (dates && dates.length) {
            dates = dates.map((d) => new Date(d));
        }
        prisma.events
            .create({
                data: {
                    name,
                    title,
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
                    is_feedback_enabled,
                    attendance_type,
                    registration_type,
                    external_registration_link,
                    is_ticket_feature_enabled,
                    organizer_id: req.user.id,
                    dates,
                    state_history: ["DRAFT"],
                },
            })
            .then((event) => {
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
    }
});
router.get("/:id", async (req, res) => {
    try {
        let event = await prisma.events.findUniqueOrThrow({
            where: {
                id: parseInt(req.params.id),
            },
            select: {
                id: true,
                name: true,
                description: true,
                long_description: true,
                is_only_somaiya: true,
                fee: true,
                tags: true,
                banner_url: true,
                logo_image__url: true,
                event_page_image_url: true,
                is_feedback_enabled: true,
                attendance_type: true,
                registration_type: true,
                external_registration_link: true,
                is_ticket_feature_enabled: true,
                dates: true,
                venue: true,
                organizer: {
                    select: {
                        name: true,
                        photo_url: true,
                        id: true,
                        email: true,
                    },
                },
                organizer_id: true,
                state: true,
                name: true,
                tag_line: true,
                Participant: {
                    where: {
                        user_id: req.user.id,
                    },
                    select: {
                        ticket_collected: true,
                    },
                },
                start_in_event_activity: true,
                in_event_activity: true,
            },
        });
        console.log(event);
        res.json({ error: false, event });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ error: true, message: "error fetching" });
    }
});
router.put("/:id", validateUpdateFields, async (req, res) => {
    if (req.user.role != "COUNCIL" && req.user.role != "FACULTY") {
        return res.status(403).json({ error: true, message: "Forbidden" });
    }
    let state_history = [];
    let state = "";
    try {
        const event = await prisma.events.findUniqueOrThrow({
            where: {
                id: parseInt(req.params.id),
            },
        });
        state_history = event.state_history;
        state = event.state;
        if (event.organizer_id != req.user.id && req.user.role != "FACULTY") {
            return res.status(403).json({ error: true, message: "Forbidden" });
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
    console.log(field);
    console.log(req.body);

    try {
        if (field.state != state) {
            state_history.push(field.state);
            field.state_history = state_history;
        }
        await prisma.events.update({
            where: {
                id: parseInt(req.params.id),
            },
            data: field,
        });
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
});
router.post("/:id/register", async (req, res) => {
    let event_id = req.params.id;
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
                message: "Team event registration not yet implmented",
            });
        }
        if (!req.user.is_somaiya_student && event.is_only_somaiya) {
            return res.status(403).json({
                error: true,
                message:
                    "Only Somaiya participants are allowed to register for this event",
            });
        }
        try {
            await prisma.participant.create({
                data: {
                    event_id: parseInt(event_id),
                    user_id: req.user.id,
                    amount: event.fee,
                    payment_status: event.fee == 0 ? "SUCCESS" : "PENDING",
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
router.post("/:id/claim-ticket", async (req, res) => {
    let event_id = req.params.id;
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
router.get("/:id/children", async (req, res) => {
    try {
        let events = await prisma.events.findMany({
            where: {
                parent_id: parseInt(req.params.id),
            },
            select: {
                id: true,
                name: true,
                description: true,
                long_description: true,
                is_only_somaiya: true,
                parent_id: true,
                parent: {
                    select: {
                        id: true,
                        name: true,
                        parent_id: true,
                        description: true,
                        long_description: true,
                        banner_url: true,
                        logo_image__url: true,
                        event_page_image_url: true,
                        dates: true,
                        venue: true,
                        tag_line: true,
                        organizer: {
                            select: {
                                name: true,
                                photo_url: true,
                                id: true,
                                email: true,
                            },
                        },
                        organizer_id: true,
                        state: true,
                    },
                },
                fee: true,
                tags: true,
                banner_url: true,
                logo_image__url: true,
                event_page_image_url: true,
                is_feedback_enabled: true,
                attendance_type: true,
                registration_type: true,
                external_registration_link: true,
                is_ticket_feature_enabled: true,
                dates: true,
                venue: true,
                organizer: {
                    select: {
                        name: true,
                        photo_url: true,
                        id: true,
                        email: true,
                    },
                },
                organizer_id: true,
                state: true,
                name: true,
                tag_line: true,
                Participant: {
                    where: {
                        user_id: req.user.id,
                    },
                    select: {
                        ticket_collected: true,
                    },
                },
                start_in_event_activity: true,
                in_event_activity: true,
            },
        });
        console.log(events);
        res.json({ error: false, events });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ error: true, message: "error fetching" });
    }
});
router.get("/search/", async (req, res) => {
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
                    { name: { contains: q } },
                    { description: { contains: q } },
                    { long_description: { contains: q } },
                    { tags: { hasSome: [q] } },
                ],
            },
            orderBy: {
                created_at: "desc",
            },
            take: 10,
            select: {
                id: true,
                name: true,
                name: true,
                organizer: {
                    select: {
                        id: true,
                        name: true,
                        photo_url: true,
                    },
                },
                tag_line: true,
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
router.get("calendar", (req, res) => {
    return res.json({
        error: false,
        message: "Calendar endpoint yet to be implemented",
    });
});

module.exports = router;
