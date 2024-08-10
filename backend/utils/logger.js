// utils/logger.js
const bunyan = require('bunyan');

const logger = bunyan.createLogger({
  name: 'eventio',
  level: process.env.LOG_LEVEL || 'info', // Set the log level as needed
  streams: [
    {
      stream: process.stdout,
    },
    // {
    //   type: 'rotating-file',
    //   path: 'logs/app.log',
    //   period: '1d', // daily rotation
    //   count: 3, // keep 3 back copies
    // },
  ],
});

module.exports = logger;