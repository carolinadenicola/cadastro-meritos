const { createLogger, transports, format } = require('winston');

const logger = createLogger({

    format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(({timestamp, message}) => {
            return `${timestamp} ${message}`;
        })
    ),
    transports: [
        new transports.File({
            filename: "logs/erros.log",
            level: 'error',
        }),

        new transports.File({
            filename: "logs/log-geral.log",
            level: 'debug',

        }),
    ]
});


module.exports = logger;