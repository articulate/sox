const { always, curry, partial } = require('ramda')

const db = require('level')('./db', { valueEncoding: 'json' })

const fetch = opts =>
  new Promise((resolve, reject) => {
    const result = []
    db.createReadStream(opts)
      .on('data', result.push.bind(result))
      .on('end', partial(resolve, [ result ]))
      .on('error', reject)
  })

const put = curry((key, val) =>
  db.put(key, val).then(always(val))
)

module.exports = { fetch, put }
