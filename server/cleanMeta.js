const { dissocPath } = require('ramda')

// cleanMeta :: Action -> Action
const cleanMeta =
  dissocPath(['meta', 'socket'])

module.exports = cleanMeta
