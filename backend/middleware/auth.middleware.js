const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma_client");
const logger = require("../utils/logger");

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
        req.user = decoded;
    } catch (err) {
        return res.status(401).json({ error: true, message: "Invalid Token" });
    }
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    return next();
}
module.exports = authCheck;
