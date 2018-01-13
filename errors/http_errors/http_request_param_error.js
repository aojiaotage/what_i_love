const HTTPBaseError = require('./http_base_error');

const ERROR_CODE = 4000000;


/**
 *
 * @param paraName 字段名，内部使用
 * @param desc 描述，用于对用户展示
 * @param msg 信息，用于内部使用
 */
class HTTPReqParamError extends HTTPBaseError {

  constructor(paramName, desc, msg) {
    super(200, desc, ERROR_CODE, `${paramName} wrong: ${msg}`);
  }
}

module.exports = HTTPReqParamError;
