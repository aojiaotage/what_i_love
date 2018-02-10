const Spider = require('../models/mongoose/spider');
const HTTPReqParamError = require(
  '../errors/http_errors/http_request_param_error');
const HTTPBaseError = require('../errors/http_errors/http_base_error');
const logger = require('../utils/loggers/logger');
const Content = require('../models/mongoose/content');
const ESService = require('../services/es_service');
const axios = require('axios');

/**
 *
 * @param spider 爬虫服务对象
 * @param spider.name 服务名，唯一
 * @param spider.validationUrl 校验地址
 * @returns {Promise.<Spider>}
 */
async function registerSpider(spider) {
  const validations = {
    name: (name) => {
      if (!name) {
        throw new HTTPReqParamError(
          'spider service name',
          '名字不能为空',
          'a spider service name can not be empty',
        );
      }
    },
    validationUrl: (url) => {
      if (!url) {
        throw new HTTPReqParamError(
          'spider service validation url',
          '验证URL不能为空',
          'a spider service validation url can not be empty',
        );
      }
      if (url.indexOf('http') === -1) {
        throw new HTTPReqParamError(
          'spider service validation url',
          '非法的URL',
          'a spider service validation url must be a valid url',
        );
      }
    },
  };

  const keys = Object.keys(validations);
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    validations[k](spider[k]);
  }

  const res = await axios.get(spider.validationUrl).catch((e) => {
    logger.error(
      'error validating spider service on provided validation url',
      {
        errMsg: e.message,
        errStack: e.stack,
      },
    );
    throw new HTTPBaseError(
      400,
      '服务验证失败，请检查爬虫服务是否可用',
      40000200,
      'error validating spider validation url',
    );
  });

  if (res && res.data) {
    const spiderServiceResponseValidation = {
      code: (code) => {
        if (code !== 0) {
          throw new HTTPBaseError(
            400,
            `爬虫服务返回错误码: ${code}`,
            40000201,
            'spider service returns a error code',
          );
        }
      },
      protocol: (protocol) => {
        if (!protocol) {
          throw new HTTPBaseError(
            400,
            '协议错误: 空的协议',
            40000202,
            'spider validation url can not return a empty protocol obj',
          );
        }
        if (protocol.name !== 'FULL_NET_SPIDER_PROTOCOL') {
          throw new HTTPBaseError(
            400,
            `协议错误: 错误的版本${protocol.name}`,
            40000203,
            `invalid spider service protocol name ${protocol.name}`,
          );
        }
        if (protocol.version !== '0.1') {
          throw new HTTPBaseError(
            400,
            `协议错误: 错误的版本${protocol.version}`,
            40000204,
            `invalid spider service protocol version ${protocol.version}`,
          );
        }
      },
      config: (config) => {
        if (!config) {
          throw new HTTPBaseError(
            400,
            '协议错误: 空的配置',
            40000205,
            'spider validation url can not return a empty config obj',
          );
        }
        if (!config.contentList) {
          throw new HTTPBaseError(
            400,
            '协议错误: 空的配置',
            40000205,
            'spider validation url can not return a empty config obj',
          );
        }
        if (!config.contentList) {
          throw new HTTPBaseError(
            400,
            '配置错误: 空的列表接口',
            40000206,
            'spider validation url can not return a empty content list obj',
          );
        }
        if (!config.contentList.url || !config.contentList.pageSizeLimit ||
          !config.contentList.frequencyLimit) {
          throw new HTTPBaseError(
            400,
            '配置错误：不完整的contentList对象',
            40000207,
            'spider validation url has to return a valid config content list obj',
          );
        }
      },
    };

    const resKeys = Object.keys(spiderServiceResponseValidation);
    for (let i = 0; i < resKeys.length; i += 1) {
      const k = resKeys[iz];
      spiderServiceResponseValidation[k](res.data[k]);
    }
  }

  const toCreate = {
    name: spider.name,
    validationUrl: spider.validationUrl,
    contentList: res.data.config.contentList,
    singleContent: res.data.config.singleContent,
    status: 'validated',
  };

  const createdSpider = await Spider.registerSpider(toCreate);
  return createdSpider;
}

async function startFetchingProcess(spider) {
  const { contentList } = spider;
  let { latestId } = spider;
  const { url, pageSizeLimit, frequencyLimit } = contentList;

  const actualPeriodMills = Math.ceil(1000 / frequencyLimit) * 2;

  async function fetch(startTime, lastId) {
    const list = await fetchingLists(url, lastId, pageSizeLimit);
    const upsertPromises = [];
    const wrappedContent = list.map((c) => {
      const wrapped = {
        spiderServiceId: spider._id,
        spiderServiceContentId: c.contentId,
        contentType: c.contentType,
        content: c.content,
        tags: c.tags,
        title: c.title,
      };

      upsertPromises.push(Content.model.findOneAndUpdate(
        { spiderServiceContentId: c.contentId },
        wrapped,
        {
          upsert: true,
          new: true,
        },
      ));
      return wrapped;
    });

    const insertedOrUpdatedList = await Promise.all(upsertPromises)
      .catch((e) => {
        logger.error(
          'error inserting spider service content to db',
          { err: e },
        );
      });

    latestId = wrappedContent[wrappedContent.length -
    1].spiderServiceContentId;

    spider.lastestId = latestId;
    await spider.save()

    if (wrappedContent.length < pageSizeLimit) {
      return;
    }

    ESService.createOrUpdateContents(insertedOrUpdatedList);

    const endTime = Date.now().valueOf();
    const timePassed = endTime - startTime;

    const timeout = timePassed - actualPeriodMills < 0 ? actualPeriodMills -
      timePassed : 0;

    setTimeout(() => {
      fetch(endTime, latestId)
        .catch((e) => {
          logger.error(
            'error fetching list data from spider service',
            {
              errMsg: e.message,
              errStack: e.stack,
            },
          );
        });
    }, timeout);
  }

  fetch()
    .catch((e) => {
      logger.error(
        'error fetching list data from spider service',
        {
          errMsg: e.message,
          errStack: e.stack,
        },
      );
    });
}

async function fetchingLists(url, latestId, pageSize) {

  const contentList = await axios.get(
    url,
    {
      params: {
        latestId,
        pageSize,
      },
    },
  )
    .then((res) => {
      if (!res.data || !res.data.contentList) {
        throw new Error('invalid response from spider service');
      }
      return res.data.contentList;
    })
    .catch((e) => {
      logger.error('error fetching content from spider', {
        errMsg: e.message,
        errStack: e.stack,
      });
    });

  return contentList;
}

async function initSpiders() {
  const spiders = await Spider.model.find({ status: 'validated' });
  for (let i = 0; i < spiders.length; i++) {
    const spider = spiders[i];
    startFetchingProcess(spider)
      .catch((e) => {
        logger.error(
          `error starting fetching process on spider ${spider._id}`,
          {
            errMsg: e.message,
            errStack: e.stack,
          },
        );
      });
  }
}

initSpiders()
  .catch((e) => {
    logger.error(
      'error initializing spider processes',
      {
        errMsg: e.message,
        errStack: e.stack,
      },
    );
  });

module.exports = {
  registerSpider,
};
