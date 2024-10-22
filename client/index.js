const action  = require('@articulate/ducks/lib/action')
const Async   = require('crocks/Async')
const bind    = require('ramda/src/bind')
const compose = require('ramda/src/compose')
const cuid    = require('cuid')
const curry   = require('ramda/src/curry')
const error   = require('@articulate/ducks/lib/error')
const evolve  = require('ramda/src/evolve')
const { io }  = require('socket.io-client')
const merge   = require('ramda/src/merge')
const pick    = require('ramda/src/pick')
const URL     = require('url')

const debounce = require('./debounce')
const throttle = require('./throttle')
const toError  = require('./toError')

const ALLOWED_OPTIONS = [
  'randomizationFactor',
  'reconnection',
  'reconnectionAttempts',
  'reconnectionDelay',
  'reconnectionDelayMax',
  'timeout',
  'transports',
  'upgrade',
  'withCredentials',
]

const key = curry((type, payload) =>
  `${type}/${payload.id}`
)

const sox = (args = {}) => {
  const {
    clientOptions = {},
    query = Function.prototype,
    uri   = ''
  } = args

  const session = { session: cuid() }
  const url     = URL.parse(uri)
  const base    = URL.format(pick(['protocol', 'slashes', 'host'], url))

  const options = {
    autoConnect: false,
    path: url.pathname,
    query: merge(session, query())
  }

  const extraOptions = pick(ALLOWED_OPTIONS, clientOptions)
  const socket = io(base, merge(extraOptions, options))

  const connect = bind(socket.connect, socket)

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

  const sendWithOptions = curry((options, type, payload) => {
    const { timeout } = options
    let sent = send(type, payload)

    if (timeout != null) {
      const err = error(type, { message: `Timeout after ${timeout}ms` })
      sent = sent.race(Async.rejectAfter(timeout, err))
    }

    return sent
  })

  const updateQuery = () =>
    socket.io.opts.query = merge(session, query())

  // connect : () -> Socket
  socket.connect = compose(connect, updateQuery)

  // debounce : Number -> String -> a -> IO Async Action
  socket.debounce = curry((wait, type) =>
    debounce(wait, key(type), send(type))
  )

  // send : String -> a -> Async Action
  socket.send = send

  // sendWithOptions : { k: v } -> String -> a -> Async Action
  socket.sendWithOptions = sendWithOptions

  // session : String
  Object.assign(socket, session)

  // debounce : Number -> String -> a -> IO Async Action
  socket.throttle = curry((wait, type) =>
    throttle(wait, key(type), send(type))
  )

  socket.on('reconnect_attempt', updateQuery)

  return socket
}

module.exports = sox
