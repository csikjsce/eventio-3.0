const express = require("express");
const router = express.Router();
const authCheck = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma_client");
const logger = require("../utils/logger");

router.get("/me", authCheck, (req, res) => {
    delete req.user["google_id"];
    delete req.user["refresh_token"];
    delete req.user["updated_at"];
    delete req.user["created_at"];
    delete req.user["council_type"];
    delete req.user["about"];
    res.json({
        error: false,
        user: req.user,
    });
});
router.put("/me", authCheck, (req, res) => {
    const {
        degree,
        branch,
        gender,
        interests,
        phone_number,
        roll_number,
        year,
        college,
    } = req.body;
    if (
        !degree ||
        !branch ||
        !gender ||
        !interests ||
        !phone_number ||
        !year ||
        !college
    ) {
        return res
            .status(400)
            .json({ error: true, message: "All fields are required" });
    }
    prisma.user
        .update({
            where: { id: req.user.id },
            data: {
                degree,
                branch,
                gender,
                interests,
                phone_number,
                roll_number,
                year,
                college,
            },
        })
        .then((user) => {
            res.json({
                error: false,
                message: "User profile updated successfully",
            });
        })
        .catch((err) => {
            logger.error(err);
            res.status(500).json({
                error: true,
                message: "Failed to update user profile",
            });
        });
});

module.exports = router;
