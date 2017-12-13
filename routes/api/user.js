const express = require('express');

const router = express.Router();
const UserService = require('../../services/user_service');
const apiRes = require('../../utils/api_response');
const auth = require('../../middlewares/auth');

router.get('/', async (req, res, next) => {
  (async () => {
    const users = await UserService.getAllUsers();
    return {
      users,
    };
  })()
    .then((r) => {
      res.data = r;
      apiRes(req, res);
    })
    .catch((e) => {
      next(e);
    });
});

router.post('/', (req, res, next) => {
  (async () => {
    const { username, password, name } = req.body;
    const result = await UserService.addNewUser({
      username,
      password,
      name,
    });
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

router.get('/:userId', (req, res, next) => {
  (async () => {
    const { userId } = req.params;
    const user = await UserService.getUserById(userId);
    return {
      user,
    };
  })()
    .then((r) => {
      res.data = r;
      apiRes(req, res);
    })
    .catch((e) => {
      next(e);
    });
});

router.post('/:userId/subscription', auth(), (req, res, next) => {
  (async () => {
    const { userId } = req.params;
    const sub = UserService.createSubscription(
      userId,
      req.body.url,
    );
    return {
      sub,
    };
  })()
    .then((r) => {
      res.data = r;
      apiRes(req, res);
    })
    .catch((e) => {
      next(e);
    });
});

module.exports = router;
