const { lensProp } = require('ramda')
const { overP } = require('@articulate/funky')

// overPayload :: (a -> Promise b) -> Action -> Promise Action
const overPayload =
  overP(lensProp('payload'))

module.exports = overPayload
