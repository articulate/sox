const { curry } = require('ramda')

// action :: String -> a -> Action
const action = (type, payload) =>
  ({ type, payload })

module.exports = curry(action)
