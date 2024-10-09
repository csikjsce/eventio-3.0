const express = require("express");
const userRoute = require("./users.route");
const authRoute = require("./auth.route");
const eventRoute = require("./events.route");
const councilRoute = require("./councils.route");

const router = express.Router();

router.use("/users", userRoute);
router.use("/auth", authRoute);
router.use("/events", eventRoute);
router.use("/councils", councilRoute);

router.get("/health", async (req, res) => {
    res.json({
        status: "Up and running",
    });
});

module.exports = router;
