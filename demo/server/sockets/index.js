const { compose, mergeAll, tap, values } = require('ramda')
const io = require('socket.io')
const { handle, mount } = require('@articulate/sox')

const actions = require('require-dir')()

const app =
  compose(handle, mergeAll, values)(actions)

const sockets = server =>
  io(server).use(mount({ app }))

module.exports = tap(sockets)
