const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

let protected = "/p";

router.post(protected + "/get-councils", (req, res) => {});

module.exports = router;
