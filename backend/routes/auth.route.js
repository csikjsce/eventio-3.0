const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const passport = require("passport");
const prisma = require("../utils/prisma_client");
const logger = require("../utils/logger");

router.get("/google", (req, res, next) => {
    passport.authenticate("google", {
        scope: ["profile", "email"],
        hd: "somaiya.edu"
    })(req, res, next);
});

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: `${process.env.CLIENT_URL}?failure=${400}`,
    }),
    async (req, res) => {
        const user = req.user;

        const accessToken = jwt.sign(
            { user_id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.AT_EXPIRATION }
        );
        const refreshToken = jwt.sign(
            { user_id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.RT_EXPIRATION }
        );

        prisma.user
            .update({
                where: { google_id: user.id },
                data: { refresh_token: refreshToken },
            })
            .catch((e) => {
                logger.error(e);
                res.redirect(`${process.env.CLIENT_URL}?failure=${500}`);
            });

        res.redirect(
            `${
                process.env.CLIENT_URL + process.env.FRONTEND_REDIRECT_PATH
            }?accessToken=${accessToken}&refreshToken=${refreshToken}`
        );
    }
);

router.post("/refresh-token", async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res
            .status(400)
            .json({ error: true, message: "Refresh token is required" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.user_id },
        });

        if (!user || user.refresh_token !== refreshToken) {
            return res
                .status(401)
                .json({ error: true, message: "Invalid refresh token" });
        }

        const accessToken = jwt.sign(
            { user_id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.AT_EXPIRATION }
        );
        res.json({ accessToken });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: true, message: "Invalid refresh token" });
    }
});

module.exports = router;
