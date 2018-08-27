const io = require('socket.io')
const { mount } = require('@articulate/sox')
const redis = require('socket.io-redis')
const { tap } = require('ramda')

const sockets = server =>
  io(server)
    .adapter(redis(process.env.REDIS_URI))
    .use(mount())

module.exports = tap(sockets)
