const { dissocPath, pipe } = require('ramda')

// cleanMeta :: Action -> Action
const cleanMeta = pipe(
  dissocPath(['meta', 'session']),
  dissocPath(['meta', 'socket'])
)

module.exports = cleanMeta
