const es = require('elasticsearch');
const { Client } = es;
const settings = require('../setting').elasticsearch;
const client = new Client({
  host: settings.host,
});

const CONTENT_INDEX = 'what_i_love';
const CONTENT_TYPE = 'content';

async function createOrUpdateContent(content) {
  const doc = {
    title: content.title,
    tags: content.tags,
    serviceId: content.spiderServiceId,
  };
  await client.update({
    index: CONTENT_INDEX,
    type: CONTENT_TYPE,
    id: content._id.toString(),
    body: {
      doc: doc,
      upsert: doc,
    },
  });
}

async function createOrUpdateContents(contents) {
  const ps = [];
  for (const content of contents) {
    ps.push(createOrUpdateContent(content));
  }
  await Promise.all(ps);
}

module.exports = {
  createOrUpdateContent,
  createOrUpdateContents,
};
