require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const httpLogger = require("./utils/logger_middleware");
const logger = require("./utils/logger");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("./utils/prisma_client");
const session = require("express-session");

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
                } catch (err) {
                    logger.error(err);
                    return done(
                        new Error("error fetching/creating user"),
                        null
                    );
                }
            }
        }
    )
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
    session({ secret: "secretkey", resave: false, saveUninitialized: true })
);
app.use(passport.session());
app.use(httpLogger);
app.use(express.json());
app.use(
    cors({
        origin: "*",
        credentials: true,
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
