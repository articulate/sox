const { curryN, tap } = require('ramda')

// leave : Socket -> (a -> String) -> a -> a
const leave = curryN(2, (socket, room) => tap(data =>
  socket.leave(room(data))
))

module.exports = leave
