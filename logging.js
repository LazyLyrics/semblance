const { format, createLogger, transports } = require("winston");
const { combine, splat, timestamp, printf } = format
require('dotenv').config()
const ENV = process.env

const defaultFormat = printf(({ level, msg, timestamp, ...metadata}) => {
  let log = `${timestamp} [${level}]: ${msg}`
  if (metadata) {
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
    new transports.Console({
      level: 'warn'
    }),
    new transports.File({
      filename: "debug.log",
      level: 'debug'
    })
  ],
  exitOnError: true
})

if (ENV.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.simple(),
    level: "debug"
  }));
}

module.exports = logger
