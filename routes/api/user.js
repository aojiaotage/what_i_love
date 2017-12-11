const express = require('express');

const router = express.Router();
const UserService = require('../../services/user_service');
const apiRes = require('../../utils/api_response');

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
    const { firstName, lastName, age } = req.body;
    const user = await UserService.addNewUser(firstName, lastName, age);
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

router.post('/:userId/subscription', (req, res, next) => {
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
