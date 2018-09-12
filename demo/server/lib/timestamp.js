const { assoc, curry } = require('ramda')

const timestamp = (key, data) =>
  assoc(key, Date.now(), data)

module.exports = curry(timestamp)
