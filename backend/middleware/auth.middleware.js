const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma_client");
const logger = require("../utils/logger");
const { get, set, keys, TTL } = require("../utils/cache");

async function authCheck(req, res, next) {
    let token = req.headers["authorization"];
    if (!token) {
        return res.status(403).json({
            error: true,
            message: "A token is required for authentication",
        });
    }
    try {
        token = token.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Cache user lookup to avoid a DB round-trip on every request.
        const cacheKey = keys.user(decoded.user_id);
        let user = get(cacheKey);

        if (!user) {
            user = await prisma.user.findUnique({
                where: { google_id: decoded.user_id },
            });
            if (!user) {
                return res.status(401).json({ error: true, message: "User not found" });
            }
            set(cacheKey, user, TTL.USER);
        }

        req.user = user;
    } catch (err) {
        logger.error(err);
        return res.status(401).json({ error: true, message: "Invalid Token" });
    }
    return next();
}

module.exports = authCheck;
