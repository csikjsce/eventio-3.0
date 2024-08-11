const express = require("express");
const router = express.Router();
const authCheck = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma_client");
const logger = require("../utils/logger");

let protected = "/p";
router.post(protected + "/me", authCheck, (req, res) => {
    let newUser = {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        photo_url: req.user.photo_url,
    };
    res.json({
        error: false,
        user: newUser,
    });
});
router.post(protected + "/update", authCheck, (req, res) => {
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
        !roll_number ||
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
