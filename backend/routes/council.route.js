const express = require("express");
const authCheck = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma_client");
const router = express.Router();

router.get("/", authCheck, async (req, res) => {
    const councils = await prisma.user.findMany({
        where: {
            role: "COUNCIL",
        },
        select: {
            name: true,
            photo_url: true,
            id: true,
            email: true,
            phone_number: true,
        },
    });
    res.json({
        error: false,
        councils: councils,
    });
});

module.exports = router;
