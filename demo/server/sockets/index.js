const { compose, mergeAll, tap, values } = require('ramda')
const io = require('socket.io')
const { handle, logger, mount } = require('@articulate/sox')

const actions = require('require-dir')()

const handler = compose(handle, mergeAll, values)(actions)

const app = compose(handler, logger)  // NEXT UP: obviate this

const sockets = server =>
  io(server).use(mount({ app }))

module.exports = tap(sockets)
