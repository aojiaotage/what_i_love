const express = require('express');

const router = express.Router();

const userRouter = require('./user');

router.use('/user', userRouter);

module.exports = router;
