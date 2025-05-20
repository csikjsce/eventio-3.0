const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const passport = require("passport");
const prisma = require("../utils/prisma_client");
const logger = require("../utils/logger");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "postmessage",
);

router.get("/google", (req, res, next) => {
    passport.authenticate("google", {
        scope: ["profile", "email"],
        ...(process.env.NODE_ENV == "production" && { hd: "somaiya.edu" }),
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
            { expiresIn: process.env.AT_EXPIRATION },
        );
        const refreshToken = jwt.sign(
            { user_id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.RT_EXPIRATION },
        );

        const userDB = await prisma.user
            .update({
                where: { google_id: user.id },
                data: { refresh_token: refreshToken },
            })
            .catch((e) => {
                logger.error(e);
                res.redirect(`${process.env.CLIENT_URL}?failure=${500}`);
            });
        let redirectURL;
        switch (userDB.role) {
            case "FACULTY":
                redirectURL = process.env.FACULTY_CLIENT_URL;
                break;
            case "COUNCIL":
                console.log("user redirecting");
                console.log(userDB.role)
                redirectURL = process.env.COUNCIL_CLIENT_URL;
                break;
            case "PRINCIPAL":
                redirectURL=process.env.FACULTY_CLIENT_URL;
                break;
            default:
                redirectURL = process.env.CLIENT_URL;
        }
        res.redirect(
            `${
                redirectURL + process.env.FRONTEND_REDIRECT_PATH
            }?accessToken=${accessToken}&refreshToken=${refreshToken}`,
        );
    },
);
router.post("/googleToken", async (req, res) => {
    try {
        const { tokens } = await client.getToken(req.body.code);
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const google_id = payload.sub;
        const user = await prisma.user.findUnique({
            where: { google_id },
        });
        if (!user) {
            let email = payload.email;
            let is_somaiya_student = email.split("@")[1] == "somaiya.edu";
            const accessToken = jwt.sign(
                { user_id: google_id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.AT_EXPIRATION },
            );
            const refreshToken = jwt.sign(
                { user_id: google_id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.RT_EXPIRATION },
            );
            try {
                let new_user = await prisma.user.create({
                    data: {
                        google_id,
                        email,
                        name: payload.name,
                        photo_url: payload.picture,
                        is_somaiya_student,
                        refresh_token: refreshToken,
                    },
                });
                delete new_user["google_id"];
                delete new_user["refresh_token"];
                delete new_user["updated_at"];
                delete new_user["created_at"];
                delete new_user["council_type"];
                delete new_user["about"];
                return res.json({
                    accessToken,
                    refreshToken,
                    user: new_user,
                });
            } catch (err) {
                logger.error(err);
                console.error(err);
                return res
                    .status(500)
                    .json({ error: true, message: "Internal server error" });
            }
        } else {
            const accessToken = jwt.sign(
                { user_id: user.google_id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.AT_EXPIRATION },
            );
            const refreshToken = jwt.sign(
                { user_id: user.google_id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.RT_EXPIRATION },
            );
            delete user["google_id"];
            delete user["refresh_token"];
            delete user["updated_at"];
            delete user["created_at"];
            delete user["council_type"];
            delete user["about"];
            return res.json({
                accessToken,
                refreshToken,
                user,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: true, message: "Invalid token" });
    }
});

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
            where: { google_id: decoded.user_id },
        });

        if (!user || user.refresh_token !== refreshToken) {
            return res
                .status(401)
                .json({ error: true, message: "Invalid refresh token" });
        }

        const accessToken = jwt.sign(
            { user_id: user.google_id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.AT_EXPIRATION },
        );
        res.json({ accessToken });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: true, message: "Invalid refresh token" });
    }
});

module.exports = router;
