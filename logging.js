const { format, createLogger, transports } = require("winston");
const { combine, splat, timestamp, printf } = format
require('dotenv').config()
const ENV = process.env

const defaultFormat = printf(({ level, message, timestamp, ...metadata}) => {
  let log = `${timestamp} [${level}]: ${message}`
  if (metadata.length > 0) {
    log += JSON.stringify(metadata)
  }
  return log
})

const logger = createLogger({
  level: "debug",
  format: combine(
    format.colorize(),
    format.timestamp(),
    defaultFormat
    ),
  transports: [
    new transports.File({
      filename: "logs/debug.log",
      level: 'debug'
    })
  ],
  exitOnError: true
})

if (ENV.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    level: "debug"
  }));
}

module.exports = logger
