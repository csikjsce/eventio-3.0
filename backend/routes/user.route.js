const express = require("express");
const router = express.Router();
const authCheck = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma_client");
const logger = require("../utils/logger");
const { del, keys } = require("../utils/cache");

let protected = "/p";
router.post(protected + "/me", authCheck, (req, res) => {
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
router.post(protected + "/update", authCheck, (req, res) => {
    const {
        name,
        degree,
        branch,
        gender,
        interests,
        phone_number,
        roll_number,
        year,
        college,
        signature,
        about,
        photo_url,
    } = req.body;

    // Build a partial update — only include fields that were actually sent
    const updateData = {};
    if (name         !== undefined) updateData.name         = name;
    if (degree       !== undefined) updateData.degree       = degree;
    if (branch       !== undefined) updateData.branch       = branch;
    if (gender       !== undefined) updateData.gender       = gender;
    if (interests    !== undefined) updateData.interests    = interests;
    if (phone_number !== undefined) {
        updateData.phone_number =
            phone_number === null || phone_number === ""
                ? null
                : String(phone_number);
    }
    if (roll_number  !== undefined) {
        updateData.roll_number =
            roll_number === null || roll_number === ""
                ? null
                : String(roll_number);
    }
    if (year         !== undefined) updateData.year         = parseInt(year);
    if (college      !== undefined) updateData.college      = college;
    if (signature    !== undefined) updateData.signature    = signature;
    if (about        !== undefined) updateData.about        = about;
    if (photo_url    !== undefined) updateData.photo_url    = photo_url;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: true, message: "No fields provided to update" });
    }

    prisma.user
        .update({
            where: { id: req.user.id },
            data: updateData,
        })
        .then(() => {
            // Bust the auth cache so next request fetches fresh user data
            del(keys.user(req.user.google_id));
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
