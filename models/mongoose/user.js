const mongoose = require('mongoose');

const { Schema } = mongoose;

const pbkdf2Async = require('bluebird').promisify(require('crypto').pbkdf2);

const PasswordConfig = require('../../cipher/password_config');

const HttpReqParaError = require(
  '../../errors/http_errors/http_request_param_error');

const UserSchema = new Schema({
  name: { type: String, required: true, index: 1 },
  age: { type: Number, min: 0, max: 120 },
  username: { type: String, required: true, unique: true },
  password: { type: String },
});

const UserModel = mongoose.model('user', UserSchema);

async function insert(user) {
  const created = await UserModel.create(user);
  return created;
}

async function getOneById(id) {
  const user = await UserModel.findOne({ _id: id }, { password: 0 });
  return user;
}

async function getOneByName(name) {
  const user = UserModel.findOne({ name }, { password: 0 });
  return user;
}

async function list(params) {
  const match = {};
  const flow = UserModel.find(match);
  flow.select({ password: 0 });
  const users = await flow.exec();
  return users;
}

async function createUserByNamePass(user) {

  const nameDupUser = await UserModel.findOne({
    $or: [
      {
        username: user.username,
      }, {
        name: user.name,
      }],
  }, { _id: 1 });

  if (nameDupUser) {
    throw new HttpReqParaError(
      'username', '用户名或昵称已经被占用啦，请再找一个吧~',
      `duplicate username: ${user.username}`,
    );
  }

  const passToSave = await pbkdf2Async(
    user.password, PasswordConfig.SALT,
    PasswordConfig.ITERATIONS, PasswordConfig.KEY_LENGTH, PasswordConfig.DIGEST,
  );

  const created = await insert({
    username: user.username,
    password: passToSave,
    name: user.name,
  });
  return {
    _id: created._id,
    username: created.username,
    name: created.name,
  };
}

async function getUserByNamePass(username, password) {

  const passToFind = await pbkdf2Async(
    password, PasswordConfig.SALT,
    PasswordConfig.ITERATIONS, PasswordConfig.KEY_LENGTH, PasswordConfig.DIGEST,
  );

  const found = await UserModel.findOne({
    username,
    password: passToFind,
  }, {
    password: 0,
  });

  return found;
}

module.exports = {
  insert,
  getOneById,
  getOneByName,
  list,
  createUserByNamePass,
  getUserByNamePass,
};
