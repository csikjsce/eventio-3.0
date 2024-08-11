const express = require("express");
const authCheck = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma_client");
const logger = require("../utils/logger");
const router = express.Router();

let protected = "/p";

router.post(protected + "/get", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.is_somaiya_student) {
        try {
            let events = await prisma.events.findMany({});
            res.json({ error: false, events: events });
        } catch (err) {
            console.log(err);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    } else {
        try {
            let events = await prisma.events.findMany({
                where: {
                    is_only_somaiya: false,
                },
            });
            res.json({ error: false, events: events });
        } catch (err) {
            console.log(err);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    }
});
router.post(protected + "/get:id", authCheck, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    try {
        let event = await prisma.events.findUnique({
            where: {
                id: parseInt(req.params.id),
            },
        });
        let eventResponse = {
            id: event.id,
            title: event.title,
            description: event.description,
            long_description: event.long_description,
            is_only_somaiya: event.is_only_somaiya,
            fee: event.fee,
            tags: event.tags,
            banner_url: event.banner_url,
            logo_image_url: event.logo_image_url,
            event_page_image_url: event.event_page_image_url,
            is_feedback_enabled: event.is_feedback_enabled,
            attendance_type: event.attendance_type,
            registration_type: event.registration_type,
            external_registration_link: event.external_registration_link,
            is_ticket_feature_enabled: event.is_ticket_feature_enabled,
        }
        res.json({ error: false, event: eventResponse });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ error: true, message: "error fetching" });
    }
});
router.post(protected + "/create", authCheck, (req, res) => {});
router.post(protected + "/search", authCheck, (req, res) => {});
router.post(protected + "/get-children/:id", authCheck, (req, res) => {});
router.post(protected + "/get-calendar", authCheck, (req, res) => {});
router.post(protected + "/register-for-event", authCheck, (req, res) => {});

module.exports = router;
