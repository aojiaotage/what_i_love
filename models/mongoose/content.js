const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const ContentSchema = new Schema({
  spiderServiceContentId: {
    type: String,
    required: true,
    index: true,
  },
  spiderServiceId: {
    type: ObjectId,
    required: true,
    index: true,
  },
  contentType: String,
  content: {
    sourceId: String,
    html: String,
    createdAt: { type: Number },
    originCreatedAt: Number,
  },
  createAt: {
    type: Number,
    default: Date.now.valueOf(),
  },
  title: String,
  tags: [
    {
      name: String,
      value: String,
      score: Number,
    },
  ],
});

const ContentModel = mongoose.model('content', ContentSchema);

module.exports = {
  model: ContentModel,
};
