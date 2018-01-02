const loggerSetting = require('../../setting').logger;
const winston = require('winston');
require('winston-daily-rotate-file');

const { Logger, transports } = winston;
const { DailyRotateFile } = transports;

const logger = new Logger({
  transports: [
    new DailyRotateFile({
      name: 'base_logger',
      filename: `${loggerSetting.path}info.log.`,
      prepend: false,
      datePattern: 'yyyy-MM-dd',
      level: 'info',
    }),
    new DailyRotateFile({
      name: 'error_logger',
      filename: `${loggerSetting.path}error.log.`,
      prepend: false,
      datePattern: 'yyyy-MM-dd',
      level: 'error',
    }),
  ],
});

module.exports = logger;
