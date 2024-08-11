const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma_client");

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
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);

        prisma.user.findUnique({
            where: { google_id: decoded.user_id },
        });

        if (!user)
            return res
                .status(401)
                .json({ error: true, message: "Invalid Token" });

        req.user = user;
    } catch (err) {
        return res.status(401).json({ error: true, message: "Invalid Token" });
    }
    return next();
}
module.exports = authCheck;
