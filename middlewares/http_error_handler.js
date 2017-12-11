const HTTPBaseError = require('../errors/http_errors/http_base_error');
const logger = require('../utils/loggers/logger');

function handler(options) {
  return function (err, req, res, next) {
    if (err instanceof HTTPBaseError) {
      const errMeta = {
        query: req.query,
        url: req.originalUrl,
        userInfo: req.user,
      };
      logger.error(err.message, errMeta);
      res.statusCode = err.httpStatusCode;
      res.json({
        code: err.errCode,
        msg: err.httpMsg,
      });
    } else {
      next(err);
    }
  };
}

module.exports = handler;
