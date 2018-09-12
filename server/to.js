const { curry } = require('ramda')

const cleanMeta = require('./cleanMeta')

// to :: (Action -> String) -> Action -> Action
const to = (room, axn) => {
  axn.meta.socket.broadcast.to(room(axn)).emit('action', cleanMeta(axn))
  return axn
}

module.exports = curry(to)
