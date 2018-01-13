const express = require('express');
const apiRes = require('../../utils/api_response');
const SpiderService = require('../../services/spider_service');

const router = express.Router();

router.route('/spider')
  .post((req, res, next) => {
    (async () => {
      const { service } = req.body;
      const createdSpider = await SpiderService.registerSpider(service);
      return {
        spider: createdSpider,
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
