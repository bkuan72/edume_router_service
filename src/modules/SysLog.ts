/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import winston = require('winston');
import DailyRotateFile from 'winston-daily-rotate-file';
import SysEnv from './SysEnv';

class Logger {
  private logger: winston.Logger;

  debugMode() {
    return SysEnv.NODE_ENV === undefined || SysEnv.NODE_ENV !== 'production';
  }
  constructor () {

    const customFormat = winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    });
    // Log unhandled exceptions to separate file
    const exceptionHandlers = [
      new (winston.transports.DailyRotateFile)({
        filename: 'logs/exceptions-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '128m',
        maxFiles: '14d'
      })
    ]
    const httpFilter = winston.format((info, opts) => {
      if (this.debugMode()) {
        return info.level === 'http' ? info : false
      } else {
        return false;
      }
    })

    const infoAndWarnFilter = winston.format((info, opts) => {
      return info.level === 'info' || info.level === 'warn' ? info : false
    })

    const errorFilter = winston.format((info, opts) => {
      return info.level === 'error' ? info : false
    })

    // Separate warn/error
    const transports = [
      new DailyRotateFile ({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '128m',
        maxFiles: '14d',
        level: 'warn',
        json: true,
        format: winston.format.combine(
          errorFilter(),
          winston.format.timestamp(),
          customFormat
        )
      }),
      new DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '128m',
        maxFiles: '14d',
        json: true,
        level: 'info',
        format: winston.format.combine(
          infoAndWarnFilter(),
          winston.format.timestamp(),
          customFormat
        )
      }),
      new DailyRotateFile({
        filename: 'logs/http-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '128m',
        maxFiles: '14d',
        json: true,
        level: 'http',
        format: winston.format.combine(
          httpFilter(),
          winston.format.timestamp(),
          customFormat
        )
      }),
      new DailyRotateFile({
        filename: 'logs/server-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
      }),
      new (winston.transports.Console)({
        level: this.debugMode() ? 'debug' : 'warn', // log warn level to console only
        handleExceptions: true,
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ]

    this.logger = winston.createLogger({
      transports: transports,
      exceptionHandlers: exceptionHandlers,
      level: this.debugMode() ? 'debug' : 'info',
      exitOnError: false,
      // Default format
      format: winston.format.combine(
        winston.format.timestamp(),
        customFormat
      )
    })

  }

  info(message: string, ...meta: any[]) {
    this.logger.info(message, ...meta);
  }

  error(message: string, ...meta: any[]) {
    this.logger.error(message, ...meta);
    console.error(message, ...meta);
  }
  http(message: string, ...meta: any[]) {
    this.logger.log('http', message, ...meta);
    console.info(message, ...meta);
  }
}
const SysLog = new Logger();

export default SysLog;