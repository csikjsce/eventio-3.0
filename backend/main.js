require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const httpLogger = require("./utils/logger_middleware");
const logger = require("./utils/logger");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("./utils/prisma_client");

const userRoute = require("./routes/user.route");
const authRoute = require("./routes/auth.route");
const eventRoute = require("./routes/event.route");
const councilRoute = require("./routes/council.route");

// passport setup
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:8000/api/v1/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await prisma.user.findUnique({
                    where: { googleId: profile.id },
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            googleId: profile.id,
                            email: profile.emails[0].value,
                            name: profile.displayName,
                            photo_url: profile.picture
                        },
                    });
                }

                return done(null, profile);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);
passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser(async (user, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

//middlewares
app.use(passport.initialize());
app.use(httpLogger);
app.use(express.json());
app.use(
    cors({
        origin: "*",
        credentials: true,
        optionsSuccessStatus: 200,
    })
);

// version
const version = "v1";

// routes
app.get("/api/" + version + "/health", async (req, res) => {
    res.json({
        status: "up and running",
    });
});

app.use("/api/" + version + "/user", userRoute);
app.use("/api/" + version + "/auth", authRoute);
app.use("/api/" + version + "/event", eventRoute);
app.use("/api/" + version + "/council", councilRoute);

const port = process.env.PORT || 8000;
app.listen(port, () => logger.debug(`Server started on port ${port}`));
