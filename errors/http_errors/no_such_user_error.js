const HttpBaseError = require('./http_base_error');

const ERROR_CODE = 3000001;

class NoSuchUserError extends HttpBaseError {
  constructor(id, username) {
    super(404, '该用户不存在', ERROR_CODE, `no such user, ${username}, ${id}`);
  }
}

module.exports = NoSuchUserError;
