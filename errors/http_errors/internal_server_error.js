const HTTPBaseError = require('./http_base_error');

const ERROR_CODE = 5000000;

class InternalServerError extends HTTPBaseError {
  constructor(msg) {
    super(500, '服务器好像开小差了，请稍后刷新吧~', ERROR_CODE, `something went wrong: ${msg}`);
  }
}

module.exports = InternalServerError;
