const express = require("express");
const authCheck = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma_client");
const { Prisma } = require("@prisma/client");
const logger = require("../utils/logger");
const validateUpdateFields = require("../middleware/field-validator.middlware");
const router = express.Router();

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

router.post(protected + "/get", authCheck, async (req, res) => {
    console.log(req.query);
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role === "COUNCIL") {
        try {
            let events = [];
            events = await prisma.events.findMany({
                where: {
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
            let event = {};
            events.forEach((e) => {
                if (!event[e.state]) [(event[e.state] = [])];
                event[e.state].push(e);
            });
            return res.json({
                error: false,
                events: event,
                message: "Events fetched successfully",
            });
        } catch (err) {
            console.log(err);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    }
    if (req.user.role === "FACULTY") {
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
                        team: {
                            select: {
                                id: true,
                                name: true,
                                leader_id: true,
                                invite_code: true,
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
            organizer_id: event.organizer_id,
            state: event.state,
            name: event.name,
            tag_line: event.tag_line,
            Participant:
                event.Participant.length == 0 ? false : event.Participant[0],
            start_in_event_activity: event.start_in_event_activity,
            in_event_activity: event.in_event_activity,
            ma_ppt: event.ma_ppt,
            min_ppt: event.min_ppt,
            comment: event.comment,
            parent_id: event.parent_id,
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
        parent_id,
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
                parent_id,
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
                req.user.role != "FACULTY"
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
router.get(protected + "/stats", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    try {
        // Fetch all events with participant stats
        const eventsStats = await prisma.events.findMany({
            // where: {
            //     organizer_id: req.user.id,
            // },
            select: {
                id: true,
                name: true,
                organizer_id: true,
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
                totalParticipants,
                yearStats,
                branchStats,
                genderStats,
            };
        });

        return res.json({ error: false, data: result });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: true,
            message: "Error fetching event stats",
        });
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
        if (event.state !== "REGISTRATION_OPEN") {
            return res.status(403).json({
                error: true,
                message: "Registrations are not open.",
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
router.post(protected + "/create-team", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    let { event_id, team_name } = req.body;
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
});
router.post(protected + "/join-team", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    let { event_id, invite_code } = req.body;
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
    let teamMembers = await prisma.participant.count({
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
    });

    if (teamMembers >= event.ma_ppt) {
        return res.status(403).json({
            error: true,
            message: "Team is full",
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

module.exports = router;
