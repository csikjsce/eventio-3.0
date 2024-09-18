const express = require("express");
const authCheck = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma_client");
const logger = require("../utils/logger");
const validateUpdateFields = require("../middleware/field-validator.middlware");
const router = express.Router();

let protected = "/p";

router.post(protected + "/get", authCheck, async (req, res) => {
    console.log(req.query);
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if(req.user.role === "COUNCIL") {
        try {
            let events = [];
            events= await prisma.events.findMany({
                where:{
                    organizer_id: req.user.id
                },
                relationLoadStrategy: "join",
                include: {
                    organizer: true,
                },
            });
            let event = {};
            events.forEach((e) => {
                if (!event[e.state]) [(event[e.state] = [])];
                event[e.state].push(e);
            });
            return res.json({ error: false, events: event, message: "Events fetched successfully" });
            
        } catch (err) {
            console.log(err);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    }
    if(req.user.role === "FACULTY") {
        try {
            let events = [];
            if(req.query.state) {
                events = await prisma.events.findMany({
                    where: {
                        state: {
                            in: req.query.state,
                        },
                    },
                    relationLoadStrategy: "join",
                    include: {
                        organizer: true,
                    },
                });
            } else {
                events = await prisma.events.findMany({
                    where: {
                        state: {
                            in: [
                                "APPLIED_FOR_APPROVAL"
                            ],
                        },
                    },
                    relationLoadStrategy: "join",
                    include: {
                        organizer: true,
                    },
                });
            }
            let event = {};
            events.forEach((e) => {
                if (!event[e.state]) [(event[e.state] = [])];
                event[e.state].push(e);
            });
            return res.json({ error: false, events: event, message: "Events fetched successfully for state " });
        } catch (err) {
            console.log(err);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    }

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
                        organizer: true,
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
                        organizer: true,
                    },
                });
            }
            let event = {};
            events.forEach((e) => {
                if (!event[e.state]) [(event[e.state] = [])];
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
                        organizer: true,
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
                        organizer: {
                            select: {
                                name: true,
                                photo_url: true,
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
            res.json({ error: false, events: event });
        } catch (err) {
            console.log(err);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    }
});
router.post(protected + "/get/:id", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    try {
        let event = await prisma.events.findUnique({
            where: {
                id: parseInt(req.params.id),
            },
            include: {
                organizer: {
                    select: {
                        name: true,
                        photo_url: true,
                    },
                },
                Participant: {
                    where: {
                        user_id: req.user.id,
                    },
                    select: {
                        attended: true,
                    },
                },
            },
        });
        console.log(event);
        let eventResponse = {
            id: event.id,
            title: event.title,
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
            state: event.state,
            name: event.name,
            Participant:
                event.Participant.length == 0 ? false : event.Participant[0],
            start_in_event_activity: event.start_in_event_activity,
            in_event_activity: event.in_event_activity,
        };
        res.json({ error: false, event: eventResponse });
    } catch (err) {
        logger.error(err);
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

    if (req.body.is_parent) {
        let {
            name,
            title,
            tag_line,
            description,
            long_description,
            event_type,
            banner_url,
            logo_image__url,
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
            logo_image__url,
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
                    logo_image__url,
                    event_page_image_url,
                    is_feedback_enabled,
                    attendance_type,
                    registration_type,
                    external_registration_link,
                    is_ticket_feature_enabled,
                    organizer_id: req.user.id,
                    dates,
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
        if (req.user.role != "COUNCIL" && req.user.role != "FACULTY") {
            return res.status(403).json({ error: true, message: "Forbidden" });
        }
        try {
            const event = await prisma.events.findUnique({
                where: {
                    id: parseInt(req.params.id),
                },
            });
            if (event.organizer_id != req.user.id && req.user.role != "FACULTY") {
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

        if (field.dates && field.dates.length) {
            field.dates = field.dates.map((d) => new Date(d));
        }
        console.log(field);
        console.log(req.body);
        try {
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
            logger.error(err);
            return res.status(500).json({
                error: true,
                message: "Error updating event",
            });
        }
    }
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
router.post(protected + "/get-children/:id", authCheck, (req, res) => {});
router.post(protected + "/get-calendar", authCheck, (req, res) => {});
router.post(protected + "/register-for-event", authCheck, async (req, res) => {
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


module.exports = router;
