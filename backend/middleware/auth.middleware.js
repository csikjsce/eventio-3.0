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

        try {
            let user = await prisma.user.findUniqueOrThrow({
                where: { google_id: decoded.user_id },
            });
            req.user = user;
        } catch (err) {
            logger.error(err);
            return res
                .status(401)
                .json({ error: true, message: "User not found" });
        }
    } catch (err) {
        return res.status(401).json({ error: true, message: "Invalid Token" });
    }
    return next();
}
module.exports = authCheck;
