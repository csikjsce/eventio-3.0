require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const httpLogger = require("./utils/logger_middleware");
const logger = require("./utils/logger");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("./utils/prisma_client");
const {
    ensureFacultyRoleForAdvisor,
    resolveRoleForNewUser,
} = require("./utils/faculty-access");
const session = require("express-session");

const userRoute = require("./routes/user.route");
const authRoute = require("./routes/auth.route");
const eventRoute = require("./routes/event.route");
const councilRoute = require("./routes/council.route");
const mailerRoute = require("./routes/mailer.route");
const documentRoute = require("./routes/document.route");
const budgetRoute = require("./routes/budget.route");
const announcementRoute = require("./routes/announcement.route");

// ─── Passport / Google OAuth ──────────────────────────────────────────────────

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
                if (user) {
                    user = await ensureFacultyRoleForAdvisor(user);
                    profile["user_id"] = user.id;
                    return done(null, profile);
                }
                throw new Error("USER_NOT_FOUND");
            } catch (e) {
                let email = profile.emails[0].value;
                let is_somaiya_student = email.split("@")[1] == "somaiya.edu";
                
                try {
                    try {
                        let admin = await prisma.admins.findUnique({
                            where: { email: email },
                        });
                        const role = await resolveRoleForNewUser(
                            email,
                            admin?.role,
                        );

                        let User = await prisma.user.create({
                            data: {
                                google_id: profile.id,
                                email: email,
                                name: profile.displayName,
                                photo_url: profile.photos[0].value,
                                is_somaiya_student: is_somaiya_student,
                                role,
                            },
                        });
                        profile["user_id"] = User.id;
                        return done(null, profile);
                    } catch (e) {
                        console.error(e);
                        const role = await resolveRoleForNewUser(email, null);
                        let user = await prisma.user.create({
                            data: {
                                google_id: profile.id,
                                email: email,
                                name: profile.displayName,
                                photo_url: profile.photos[0].value,
                                is_somaiya_student: is_somaiya_student,
                                role,
                            },
                        });
                        profile["user_id"] = user.id;
                        return done(null, profile);
                    }
                } catch (err) {
                    console.error(err);
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
        await prisma.user.findUnique({
            where: { google_id: user.id },
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// ─── Middleware stack ─────────────────────────────────────────────────────────

app.set("trust proxy", 1);
app.use(
    session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true })
);
app.use(passport.session());
app.use(httpLogger);
app.use(express.json({ limit: "2mb" }));
// CORS matches browser Origin (scheme+host+port only — path prefixes ignored).
const allowedOrigins = [
    ...new Set(
        [
            process.env.CLIENT_URL,
            process.env.COUNCIL_CLIENT_URL,
            process.env.FACULTY_CLIENT_URL,
            "https://eventio.somaiya.edu",
            "http://localhost:3000",
            "http://localhost:4173",
            "http://localhost:4174",
            "http://localhost:4175",
        ]
            .filter(Boolean)
            .map((u) => {
                try {
                    return new URL(u).origin;
                } catch {
                    return u;
                }
            })
    ),
];
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

// ─── Rate limiting ────────────────────────────────────────────────────────────

// Generous global limiter – protects against brute-force / scraping
const globalLimiter = rateLimit({
    windowMs: 60 * 1000,   // 1 minute
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: true, message: "Too many requests, please slow down." },
});

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: true, message: "Too many auth attempts. Try again later." },
});

app.use("/api", globalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

const version = "v1";
const base = "/api/" + version;

const metrics = {
    startedAt: Date.now(),
    httpRequestsTotal: 0,
    httpErrorsTotal: 0,
    httpClientErrorsTotal: 0, // 4xx
    httpDurationSumSeconds: 0,
    httpDurationCount: 0,
    byStatusClass: { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 },
    byPathGroup: {},
};

function pathGroup(urlPath) {
    if (!urlPath) return "other";
    if (urlPath.startsWith("/api/v1/health")) return "health";
    if (urlPath.startsWith("/api/v1/auth")) return "auth";
    if (urlPath.startsWith("/api/v1/event")) return "event";
    if (urlPath.startsWith("/api/v1/user")) return "user";
    if (urlPath.startsWith("/api/v1/council")) return "council";
    if (urlPath.startsWith("/api/v1/document")) return "document";
    if (urlPath.startsWith("/api/v1/budget")) return "budget";
    if (urlPath.startsWith("/api/v1/announcement")) return "announcement";
    if (urlPath.startsWith("/api/v1/mailer")) return "mailer";
    if (urlPath === "/metrics") return "metrics";
    return "other";
}

app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    metrics.httpRequestsTotal += 1;
    res.on("finish", () => {
        const seconds = Number(process.hrtime.bigint() - start) / 1e9;
        metrics.httpDurationSumSeconds += seconds;
        metrics.httpDurationCount += 1;

        const code = res.statusCode || 0;
        const cls = code >= 500 ? "5xx" : code >= 400 ? "4xx" : code >= 300 ? "3xx" : "2xx";
        metrics.byStatusClass[cls] = (metrics.byStatusClass[cls] || 0) + 1;
        if (code >= 500) metrics.httpErrorsTotal += 1;
        if (code >= 400 && code < 500) metrics.httpClientErrorsTotal += 1;

        const group = pathGroup(req.path || req.url || "");
        metrics.byPathGroup[group] = (metrics.byPathGroup[group] || 0) + 1;
    });
    next();
});

app.get(base + "/health", async (req, res) => {
    res.json({ status: "up and running" });
});

// Prometheus text exposition (scraped by monitoring stack; not public-facing ideally)
app.get("/metrics", (req, res) => {
    const mem = process.memoryUsage();
    const uptime = process.uptime();
    const cpu = process.cpuUsage();
    const avgLatency =
        metrics.httpDurationCount > 0
            ? metrics.httpDurationSumSeconds / metrics.httpDurationCount
            : 0;
    const lines = [
        "# HELP eventio_up 1 if process is up",
        "# TYPE eventio_up gauge",
        "eventio_up 1",
        "# HELP eventio_process_uptime_seconds Process uptime",
        "# TYPE eventio_process_uptime_seconds gauge",
        `eventio_process_uptime_seconds ${uptime}`,
        "# HELP eventio_http_requests_total Total HTTP requests",
        "# TYPE eventio_http_requests_total counter",
        `eventio_http_requests_total ${metrics.httpRequestsTotal}`,
        "# HELP eventio_http_errors_total Total HTTP 5xx responses",
        "# TYPE eventio_http_errors_total counter",
        `eventio_http_errors_total ${metrics.httpErrorsTotal}`,
        "# HELP eventio_http_client_errors_total Total HTTP 4xx responses",
        "# TYPE eventio_http_client_errors_total counter",
        `eventio_http_client_errors_total ${metrics.httpClientErrorsTotal}`,
        "# HELP eventio_http_duration_seconds_sum Cumulative request duration",
        "# TYPE eventio_http_duration_seconds_sum counter",
        `eventio_http_duration_seconds_sum ${metrics.httpDurationSumSeconds}`,
        "# HELP eventio_http_duration_seconds_count Request duration sample count",
        "# TYPE eventio_http_duration_seconds_count counter",
        `eventio_http_duration_seconds_count ${metrics.httpDurationCount}`,
        "# HELP eventio_http_avg_latency_seconds Average request latency since process start",
        "# TYPE eventio_http_avg_latency_seconds gauge",
        `eventio_http_avg_latency_seconds ${avgLatency}`,
        "# HELP eventio_nodejs_heap_used_bytes Heap used bytes",
        "# TYPE eventio_nodejs_heap_used_bytes gauge",
        `eventio_nodejs_heap_used_bytes ${mem.heapUsed}`,
        "# HELP eventio_nodejs_heap_total_bytes Heap total bytes",
        "# TYPE eventio_nodejs_heap_total_bytes gauge",
        `eventio_nodejs_heap_total_bytes ${mem.heapTotal}`,
        "# HELP eventio_nodejs_external_bytes External memory bytes",
        "# TYPE eventio_nodejs_external_bytes gauge",
        `eventio_nodejs_external_bytes ${mem.external}`,
        "# HELP eventio_nodejs_rss_bytes RSS bytes",
        "# TYPE eventio_nodejs_rss_bytes gauge",
        `eventio_nodejs_rss_bytes ${mem.rss}`,
        "# HELP eventio_process_cpu_user_seconds_total User CPU time",
        "# TYPE eventio_process_cpu_user_seconds_total counter",
        `eventio_process_cpu_user_seconds_total ${cpu.user / 1e6}`,
        "# HELP eventio_process_cpu_system_seconds_total System CPU time",
        "# TYPE eventio_process_cpu_system_seconds_total counter",
        `eventio_process_cpu_system_seconds_total ${cpu.system / 1e6}`,
    ];

    lines.push("# HELP eventio_http_responses_total Responses by status class");
    lines.push("# TYPE eventio_http_responses_total counter");
    for (const [cls, count] of Object.entries(metrics.byStatusClass)) {
        lines.push(`eventio_http_responses_total{status_class="${cls}"} ${count}`);
    }

    lines.push("# HELP eventio_http_requests_by_group_total Requests by API group");
    lines.push("# TYPE eventio_http_requests_by_group_total counter");
    for (const [group, count] of Object.entries(metrics.byPathGroup)) {
        lines.push(`eventio_http_requests_by_group_total{group="${group}"} ${count}`);
    }

    res.set("Content-Type", "text/plain; version=0.0.4");
    res.send(lines.join("\n") + "\n");
});

app.use(base + "/auth",         authLimiter, authRoute);
app.use(base + "/user",         userRoute);
app.use(base + "/event",        eventRoute);
app.use(base + "/council",      councilRoute);
app.use(base + "/mailer",       mailerRoute);
app.use(base + "/document",     documentRoute);
app.use(base + "/budget",       budgetRoute);
app.use(base + "/announcement", announcementRoute);

// ─── Global error handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    logger.error(err);
    res.status(err.status || 500).json({
        error: true,
        message: err.message || "Internal Server Error",
    });
});

// ─── Start server ─────────────────────────────────────────────────────────────

const port = process.env.PORT || 8000;
app.listen(port, () => logger.info(`Server started on port ${port}`));
