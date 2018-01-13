const express = require('express');
const userRouter = require('./user');
const adminRouter = require('./admin');
const UserService = require('../../services/user_service');
const apiRes = require('../../utils/api_response');

const router = express.Router();

router.post('/login', (req, res, next) => {
  (async () => {
    const { username, password } = req.body;
    const result = await UserService.loginWithNamePass(username, password);
    return result;
  })()
    .then((r) => {
      res.data = r;
      apiRes(req, res);
    })
    .catch((e) => {
      next(e);
    });
});

router.use('/user', userRouter);

router.use('/admin', adminRouter);

module.exports = router;
