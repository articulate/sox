const { curryN, tap } = require('ramda')

// join : Socket -> (a -> String) -> a -> a
const join = curryN(2, (socket, room) => tap(data =>
  socket.join(room(data))
))

module.exports = join
