const es = require('elasticsearch');
const { Client } = es;
const settings = require('../setting').elasticsearch;
const client = new Client({
  host: settings.host,
});
const Content = require('../models/mongoose/content');

const CONTENT_INDEX = 'what_i_love';
const CONTENT_TYPE = 'content';

function normalizeTagScores(tags) {
  const totalScore = tags.reduce((p, n) => {
    return p + n.score;
  }, 0);
  return tags.map((t) => {
    const newTag = Object.assign({}, t);
    newTag.score /= totalScore;
    return newTag;
  });
}

async function createOrUpdateContent(content) {
  const doc = {
    title: content.title,
    tags: normalizeTagScores(content.tags),
    serviceId: content.spiderServiceId,
  };

  await client.update({
    index: CONTENT_INDEX,
    type: CONTENT_TYPE,
    id: content._id.toString(),
    body: {
      doc,
      upsert: doc,
    },
  });
}

async function createOrUpdateContents(contents) {
  const ps = [];
  for (const content of contents) {
    const cToInsert = content.toObject && content.toObject();
    ps.push(createOrUpdateContent(cToInsert));
  }
  await Promise.all(ps);
}

async function searchByTag(query = { tag: '', page: 0, pageSize: 10 }) {
  const r = await client.search({
    index: CONTENT_INDEX,
    type: CONTENT_TYPE,
    body: {
      from: query.page * query.pageSize,
      size: query.pageSize,
      query: {
        bool: {
          disable_coord: true,
          should: [
            {
              nested: {
                path: 'tags',
                query: {
                  function_score: {
                    functions: [
                      {
                        field_value_factor: {
                          field: 'tags.score',
                          missing: 0,
                        },
                      },
                    ],
                    query: {
                      match: {
                        'tags.value': query.tag,
                      },
                    },
                    score_mode: 'sum',
                    boost_mode: 'multiply',
                  },
                },
                score_mode: 'sum',
              },
            },
          ],
        },
      },
    },
  });

  const { hits } = r.hits;
  const ids = hits.map(h => h._id);

  const contents = await Content.model.find({ _id: { $in: ids } });

  contents.sort(
    (a, b) => hits.findIndex((h) => h._id.toString() === a._id.toString()) -
    hits.findIndex((h) => h._id.toString() === b._id.toString()));

  return r;
}

module.exports = {
  createOrUpdateContent,
  createOrUpdateContents,
  searchByTag,
  client,
};
