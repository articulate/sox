const cleanMeta = require('./cleanMeta')

// to :: (Action -> String) -> Action -> Action
// to :: Emitter -> (Action -> String) -> Action -> Action
const to = (io, room) => axn => {
  if (typeof io === 'function') {
    room = io
    io = axn.meta.socket
  }

  io.broadcast.to(room(axn)).emit('action', cleanMeta(axn))
  return axn
}

module.exports = to
