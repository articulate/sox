const { curry } = require('ramda')

// leave :: (Action -> String) -> Action -> Action
const leave = (room, axn) => {
  axn.meta.socket.leave(room(axn))
  return axn
}

module.exports = curry(leave)
