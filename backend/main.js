require("dotenv").config();
const express = require("express");
const https = require("https");
const app = express();
const cors = require("cors");
const httpLogger = require("./utils/logger_middleware");
const logger = require("./utils/logger");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("./utils/prisma_client");
const session = require("express-session");

const v1Router = require("./routes/v1/router");
const v2Router = require("./routes/v2/router");

// passport setup
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:
                process.env.SERVER_URL + process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await prisma.user.findUnique({
                    where: { google_id: profile.id },
                });
                profile["user_id"] = user.id;
                return done(null, profile);
            } catch (e) {
                let email = profile.emails[0].value;
                let is_somaiya_student = email.split("@")[1] == "somaiya.edu";
                try {
                    try {
                        let admin = await prisma.admins.findUnique({
                            where: { email: email },
                        });
                        let User = await prisma.user.create({
                            data: {
                                google_id: profile.id,
                                email: email,
                                name: profile.displayName,
                                photo_url: profile.photos[0].value,
                                is_somaiya_student: is_somaiya_student,
                                role: admin.role,
                            },
                        });
                        profile["user_id"] = User.id;
                        return done(null, profile);
                    } catch (e) {
                        let user = await prisma.user.create({
                            data: {
                                google_id: profile.id,
                                email: email,
                                name: profile.displayName,
                                photo_url: profile.photos[0].value,
                                is_somaiya_student: is_somaiya_student,
                            },
                        });
                        profile["user_id"] = user.id;
                        return done(null, profile);
                    }
                } catch (err) {
                    logger.error(err);
                    return done(
                        new Error("error fetching/creating user"),
                        null,
                    );
                }
            }
        },
    ),
);
passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser(async (user, done) => {
    try {
        const p = await prisma.user.findUnique({
            where: { google_id: user.id },
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

//middlewares
app.use(passport.initialize());
app.use(
    session({ secret: "secretkey", resave: false, saveUninitialized: true }),
);
app.use(passport.session());
app.use(httpLogger);
app.use(express.json());
app.use(
    cors({
        origin: "*",
        credentials: true,
    }),
);

// routes
app.get("/api/health", async (req, res) => {
    res.json({
        status: "up and running",
    });
});

app.use("/api/v1", v1Router);
app.use("/api/v2", v2Router);

if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || 8000;
    app.listen(port, () => logger.debug(`Server started on port ${port}`));
} else {
    const fs = require("fs");
    const httpsOptions = {
        key: fs.readFileSync("./cert/privkey.pem"),
        cert: fs.readFileSync("./cert/fullchain.pem"),
    };

    https.createServer(httpsOptions, app).listen(443, () => {
        logger.info("Server started on https://localhost:443");
    });
}
