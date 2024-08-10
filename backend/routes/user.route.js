const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const passport = require("passport");

let protected = "/p";
router.post(protected + "/me", (req, res) => {});
router.post(protected + "/update", (req, res) => {});

module.exports = router;
