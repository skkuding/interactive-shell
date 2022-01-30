import format from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';
import path from "path";

const { combine, timestamp, printf } = format.format;

const SERVER_DIRECTORY = path.resolve('../log/server');
const COMPILE_DIRECTORY = path.resolve('../log/compile');
const RUN_DIRECTORY = path.resolve('../log/run');
const SYSTEM_DIRECTORY = path.resolve('../log/system');
/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */

class Logger {
    constructor(route) {
        this.route = route
        if(this.route === 'server'){
            this.logger = format.createLogger({
                format: combine(
                    timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
                    printf(info => `[${info.timestamp}] - [${info.level}] - ${info.message}`)
                ),
                transports: [
                    new WinstonDaily({
                        level: 'info',
                        datePattern: 'YYYY-MM-DD',
                        filename: SERVER_DIRECTORY + '/%DATE%.log',
                        maxFiles: 30,
                        zippedArchive: false
                    }),
                ],
            });
        }
        if(this.route === 'compile'){
            this.logger = format.createLogger({
                format: combine(
                    timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
                    printf(info => `[${info.timestamp}] - [${info.level}] - ${info.message}`)
                ),
                transports: [
                    new WinstonDaily({
                        level: 'info',
                        datePattern: 'YYYY-MM-DD',
                        filename: COMPILE_DIRECTORY + '/%DATE%.log',
                        maxFiles: 30,
                        zippedArchive: false
                    }),
                ],
            });
        }
        if(this.route === 'run'){
            this.logger = format.createLogger({
                format: combine(
                    timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
                    printf(info => `[${info.timestamp}] - [${info.level}] - ${info.message}`)
                ),
                transports: [
                    new WinstonDaily({
                        level: 'info',
                        datePattern: 'YYYY-MM-DD',
                        filename: RUN_DIRECTORY + '/%DATE%.log',
                        maxFiles: 30,
                        zippedArchive: false
                    }),
                ],
            });
        }
        if(this.route === 'system'){
            this.logger = format.createLogger({
                format: combine(
                    timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
                    printf(info => `[${info.timestamp}] - [${info.level}] - ${info.message}`)
                ),
                transports: [
                    new WinstonDaily({
                        level: 'info',
                        datePattern: 'YYYY-MM-DD',
                        filename: SYSTEM_DIRECTORY + '/%DATE%.log',
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

    info(message){
        this.logger.info(message)
    }
    debug(message){
        this.logger.debug(message)
    }
    warn(message){
        this.logger.warn(message)
    }
    error(message){
        this.logger.error(message)
    }
}

export const serverLogger = new Logger("server")
export const compileLogger = new Logger("compile")
export const runLogger = new Logger("run")
export const systemLogger = new Logger("system")
