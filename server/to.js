const { action }      = require('@articulate/ducks')
const { curryN, tap } = require('ramda')

// to : Socket -> (a -> String) -> String -> a -> a
const to = curryN(3, (socket, room, type) => tap(payload =>
  socket.broadcast.to(room(payload)).emit('action', action(type, payload))
))

module.exports = to
