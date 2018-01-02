const loggerSetting = require('../../setting').logger;
const winston = require('winston');
require('winston-daily-rotate-file');

const { Logger, transports } = winston;
const { DailyRotateFile } = transports;

const logger = new Logger({
  transports: [
    new DailyRotateFile({
      name: 'base_logger',
      filename: `${loggerSetting.path}app.log.`,
      prepend: false,
      datePattern: 'yyyy-MM-dd',
      level: 'info',
    }),
  ],
});

module.exports = logger;
