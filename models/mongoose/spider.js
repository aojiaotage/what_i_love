const mongoose = require('mongoose');
const InternalServerError = require('../../errors/http_errors/internal_server_error');
const logger = require('../../utils/loggers/logger');

const { Schema } = mongoose;
const SpiderSchema = new Schema({
  name: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  validationUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: [
      'registered',
      'validated',
      'running',
      'paused',
      'stopped',
      'up_to_date',
    ],
  },
  singleContent: {
    url: {
      type: String,
    },
    frequencyLimit: {
      type: Number,
    },
  },
  contentList: {
    url: {
      type: String,
      required: true,
    },
    pageSizeLimit: {
      type: Number,
      default: 10,
    },
    frequencyLimit: {
      type: Number,
      default: 10,
      required: true,
    },
    latestId: String,
  },
});

const SpiderModel = mongoose.model('SpiderService', SpiderSchema);

async function registerSpider(spider) {
  const created = await SpiderModel.create(spider)
    .catch((e) => {
      logger.error(
        'error creating spider when trying to register a new one',
        {
          errMsg: e.message,
          errStack: e.stack,
        },
      );
      throw new InternalServerError('error creating spider service on mongoose');
    });
  return created;
}

module.exports = {
  model: SpiderModel,
  registerSpider,
};
