const es = require('../services/es_service').client;

async function initWhatILoveIndex() {
  await es.indices.create({
    index: 'what_i_love',
  });
  await es.indices.putMapping({
    index: 'what_i_love',
    type: 'content',
    body: {
      properties: {
        tags: {
          type: 'nested',
          properties: {
            score: {
              type: 'float',
            },
            value: {
              type: 'text',
              fields: {
                keyword: {
                  type: 'keyword',
                  ignore_above: 256,
                },
              },
            },
          },
        },
      },
    },
  });
}

switch (process.argv[2]) {
  case 'init_what_i_love_index':
    initWhatILoveIndex()
      .then(() => {
        console.log('done');
        process.exit(0);
      })
      .catch((e) => {
        console.log(e);
        process.exit(1);
      });
    break;
  default:
    process.exit(0);
    break;
}
