const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

let protected = "/p";

router.post(protected + "/get", (req, res) => {});
router.post(protected + "/get:id", (req, res) => {});
router.post(protected + "/create", (req, res) => {});
router.post(protected + "/search", (req, res) => {});
router.post(protected + "/get-children/:id", (req, res) => {});
router.post(protected + "/get-calendar", (req, res) => {});
router.post(protected + "/register-for-event", (req, res) => {});

module.exports = router;
