const HttpBaseError = require('./http_base_error');

const ERROR_CODE = 4010001;

class NoAuthError extends HttpBaseError {
  constructor(token) {
    super(401, '您没有权限访问该资源', ERROR_CODE, `no auth, token: ${token}`);
  }
}

module.exports = NoAuthError;
