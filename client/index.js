const action = require('@articulate/ducks/lib/action')
const Async  = require('crocks/Async')
const cuid   = require('cuid')
const curry  = require('ramda/src/curry')
const evolve = require('ramda/src/evolve')
const io     = require('socket.io-client')
const merge  = require('ramda/src/merge')
const pick   = require('ramda/src/pick')
const URL    = require('url')

const debounce = require('./debounce')
const throttle = require('./throttle')
const toError  = require('./toError')

const key = curry((type, payload) =>
  `${type}/${payload.id}`
)

const sox = (args = {}) => {
  const {
    query = Function.prototype,
    uri   = ''
  } = args

  const session = { session: cuid() }
  const url     = URL.parse(uri)
  const base    = URL.format(pick(['protocol', 'slashes', 'host'], url))

  const opts = {
    autoConnect: false,
    path: url.pathname,
    query: merge(session, query())
  }

  const socket = io(base, opts)

  const emit = curry((type, payload, done) =>
    socket.emit('action', action(type, payload), done)
  )

  const send = curry((type, payload) =>
    Async((reject, resolve) => {
      emit(type, payload, axn => {
        axn.error ? reject(evolve({ payload: toError }, axn)) : resolve(axn)
      })
    })
  )

  const updateQuery = () =>
    socket.io.opts.query = merge(session, query())

  // debounce : Number -> String -> a -> IO Async Action
  socket.debounce = curry((wait, type) =>
    debounce(wait, key(type), send(type))
  )

  // send : String -> a -> Async Action
  socket.send = send

  socket.session = session

  // debounce : Number -> String -> a -> IO Async Action
  socket.throttle = curry((wait, type) =>
    throttle(wait, key(type), send(type))
  )

  socket.on('reconnect_attempt', updateQuery)

  return socket
}

module.exports = sox
