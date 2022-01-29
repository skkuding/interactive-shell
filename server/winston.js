const winston = require('winston') ;
const WinstonDaily = require('winston-daily-rotate-file')
const path = require("path")

const { combine, timestamp, printf, colorize, label } = winston.format;

const serverDir = path.join(__dirname, '..', '/log/server');
const compileDir = path.join(__dirname, '..', '/log/compile');
const runDir = path.join(__dirname, '..', '/log/run');
const systemDir = path.join(__dirname, '..', '/log/system')
/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */

module.exports = class Logger {
    constructor(route) {
        this.route = route
        if(this.route === 'server'){
            this.logger = winston.createLogger({
                format: combine(
                    timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
                    printf(info => `[${info.timestamp}] - [${info.level}] - ${info.message}`)
                ),
                transports: [
                    new WinstonDaily({
                        level: 'info',
                        datePattern: 'YYYY-MM-DD',
                        filename: serverDir + '/%DATE%.log',
                        maxFiles: 30,
                        zippedArchive: false
                    }),
                ],
            });
        }
        if(this.route === 'compile'){
            this.logger = winston.createLogger({
                format: combine(
                    timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
                    printf(info => `[${info.timestamp}] - [${info.level}] - ${info.message}`)
                ),
                transports: [
                    new WinstonDaily({
                        level: 'info',
                        datePattern: 'YYYY-MM-DD',
                        filename: compileDir + '/%DATE%.log',
                        maxFiles: 30,
                        zippedArchive: false
                    }),
                ],
            });
        }
        if(this.route === 'run'){
            this.logger = winston.createLogger({
                format: combine(
                    timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
                    printf(info => `[${info.timestamp}] - [${info.level}] - ${info.message}`)
                ),
                transports: [
                    new WinstonDaily({
                        level: 'info',
                        datePattern: 'YYYY-MM-DD',
                        filename: runDir + '/%DATE%.log',
                        maxFiles: 30,
                        zippedArchive: false
                    }),
                ],
            });
        }
        if(this.route === 'system'){
            this.logger = winston.createLogger({
                format: combine(
                    timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
                    printf(info => `[${info.timestamp}] - [${info.level}] - ${info.message}`)
                ),
                transports: [
                    new WinstonDaily({
                        level: 'info',
                        datePattern: 'YYYY-MM-DD',
                        filename: systemDir + '/%DATE%.log',
                        maxFiles: 30,
                        zippedArchive: false
                    }),
                ],
            })
        }

        this.logger.stream = {
            write: message => {
                this.logger.info(message);
            }
        } 
    }

    async info(message){
        this.logger.info(message)
    }
    async debug(message){
        this.logger.debug(message)
    }
    async warn(message){
        this.logger.warn(message)
    }
    async error(message){
        this.logger.error(message)
    }
}
