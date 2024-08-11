const express = require("express");
const router = express.Router();
const authCheck = require("../middleware/auth.middleware");

let protected = "/p";
router.post(protected + "/me", authCheck, (req, res) => {
    let newUser = {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        photo_url: req.user.photo_url,
    };
    res.json({
        user: newUser,
    });
});
router.post(protected + "/update", authCheck, (req, res) => {});

module.exports = router;
