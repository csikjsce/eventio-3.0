const express = require("express");
const authCheck = require("../middleware/auth.middleware");
const router = express.Router();

let protected = "/p";

router.post(protected + "/get", authCheck, (req, res) => {});
router.post(protected + "/get:id", authCheck, (req, res) => {});
router.post(protected + "/create", authCheck, (req, res) => {});
router.post(protected + "/search", authCheck, (req, res) => {});
router.post(protected + "/get-children/:id", authCheck, (req, res) => {});
router.post(protected + "/get-calendar", authCheck, (req, res) => {});
router.post(protected + "/register-for-event", authCheck, (req, res) => {});

module.exports = router;
