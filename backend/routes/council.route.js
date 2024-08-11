const express = require("express");
const jwt = require("jsonwebtoken");
const authCheck = require("../middleware/auth.middleware");
const router = express.Router();

let protected = "/p";

router.post(protected + "/get-councils", authCheck, (req, res) => {});

module.exports = router;
