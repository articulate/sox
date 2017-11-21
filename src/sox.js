const action = require('@articulate/ducks/lib/action')
const Async  = require('crocks/Async')
const cuid   = require('cuid')
const curry  = require('ramda/src/curry')
const evolve = require('ramda/src/evolve')
const io     = require('socket.io-client')

const debounce = require('./debounce')
const throttle = require('./throttle')
const toError  = require('./toError')

const key = curry((type, payload) =>
  `${type}/${payload.id}`
)

const reload = () =>
  window.location.reload(true)

const sox = opts => {
  const session = cuid()
  const socket  = io({ autoConnect: false, query: { session } })

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

  socket.on('hard-reload', reload)

  return socket
}

module.exports = sox
