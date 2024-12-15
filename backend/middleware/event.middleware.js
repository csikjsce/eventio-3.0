const prisma = require("../utils/prisma_client");
const logger = require("../utils/logger");

async function fetchEvent(req, res, next) {
    try {
        const event = await prisma.events.findUniqueOrThrow({
            where: {
                id: parseInt(req.params.id),
            },
        });
        req.event = event;
    } catch (err) {
        logger.error(err);
        return res
            .status(500)
            .json({ error: true, message: "Error fetching event" });
    }

    return next();
}
module.exports = fetchEvent;
