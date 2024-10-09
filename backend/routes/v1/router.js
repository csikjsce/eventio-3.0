const express = require("express");
const userRoute = require("./user.route");
const authRoute = require("./auth.route");
const eventRoute = require("./event.route");
const councilRoute = require("./council.route");

const router = express.Router();

router.use("/user", userRoute);
router.use("/auth", authRoute);
router.use("/event", eventRoute);
router.use("/council", councilRoute);

router.get("/health", async (req, res) => {
    res.json({
        status: "up and running",
    });
});

module.exports = router;
