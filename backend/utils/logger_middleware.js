// utils/bunyanMiddleware.js
const bunyanMiddleware = require("bunyan-middleware");
const logger = require("./logger");

const httpLogger = bunyanMiddleware({
    logger: logger,
    headerName: "X-Request-Id",
    propertyName: "reqId",
    logName: "req_id",
    requestStart: true,
});

module.exports = httpLogger;
