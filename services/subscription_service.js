const Subscription = require('../models/mongoose/subscription');
const Content = require('../models/mongoose/content');

async function createSubscription(userId, subscriptionType, sourceId) {
  const createdSub = await Subscription.upsert({
    userId,
    type: subscriptionType,
    sourceId,
  });
  return createdSub;
}

async function getSpiderServiceContents(query = { page: 0, pageSize: 10 }) {
  const subs = await Subscription.model.find({
    userId: query.userId,
    type: 'spider_service',
  }, {
    _id: 0,
    sourceId: 1,
  });

  const spiderServiceIds = subs.map(s => s.sourceId);

  const flow = Content.model.find({
    spiderServiceId: { $in: spiderServiceIds },
  });

  flow.skip(query.page * query.pageSize);
  flow.limit(query.pageSize);

  flow.sort({ _id: -1 });

  const contents = await flow.exec();
  return contents;
}

module.exports = {
  createSubscription,
  getSpiderServiceContents,
};
