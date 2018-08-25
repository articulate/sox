const { curry } = require('ramda')

// to :: (Action -> String) -> Action -> Action
const to = (room, axn) => {
  axn.meta.socket.broadcast.to(room(axn)).emit('action', axn)
  return axn
}

module.exports = curry(to)
