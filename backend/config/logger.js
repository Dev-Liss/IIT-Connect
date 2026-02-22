/**
 * ====================================
 * WINSTON LOGGER CONFIGURATION
 * ====================================
 * Structured logging with log levels, timestamps, and file rotation.
 *
 * Levels: error, warn, info, http, debug
 * - Production: logs info and above
 * - Development: logs all levels
 *
 * Outputs:
 * - Console (colourised in dev)
 * - logs/error.log  (error level only)
 * - logs/combined.log (all levels)
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

// Custom format for console output
const consoleFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize(),
    format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    })
);

// Custom format for file output (JSON for machine parsing)
const fileFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
);

const logger = createLogger({
    level: isProduction ? 'info' : 'debug',
    defaultMeta: { service: 'iit-connect-api' },
    transports: [
        // Console transport
        new transports.Console({
            format: consoleFormat,
        }),
        // Error log file
        new transports.File({
            filename: path.join(__dirname, '..', 'logs', 'error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: 5 * 1024 * 1024, // 5 MB
            maxFiles: 5,
        }),
        // Combined log file
        new transports.File({
            filename: path.join(__dirname, '..', 'logs', 'combined.log'),
            format: fileFormat,
            maxsize: 10 * 1024 * 1024, // 10 MB
            maxFiles: 5,
        }),
    ],
    // Don't exit on uncaught exceptions – let the process handler deal with it
    exitOnError: false,
});

// Morgan stream – pipe HTTP request logs into Winston at the "http" level
logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};

module.exports = logger;
