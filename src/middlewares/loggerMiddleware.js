const morgan = require('morgan')
const winston = require('winston')

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`
        })
    ),
    transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'logs/error.log' })]
})

const requestLogger = morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        '-',
        tokens['response-time'](req, res), 'ms'
    ].join(' ')
})

const errorLogger = (err, req, res) => {
    logger.error(`${req.method} ${req.url} - ${err.message}\n${err.stack}`)
    res.status(500).json({ error: 'Internal server error' })
}

module.exports = {
    logger,
    requestLogger,
    errorLogger
}
