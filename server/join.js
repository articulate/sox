const { curry } = require('ramda')

// join :: (Action -> String) -> Action -> Action
const join = (room, axn) => {
  axn.meta.socket.join(room(axn))
  return axn
}

module.exports = curry(join)
