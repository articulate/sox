const {
  assocPath, compose, curry, identity, is, path, pipe, tap, unless, when
} = require('ramda')

const cleanMeta     = require('./cleanMeta')
const defaultLogger = require('./logger')
const error         = require('./error')
const formatErrors  = require('./formatErrors')

// mount :: { k: v } -> (Socket, Function) -> ()
const mount = (opts={}) => {
  const {
    app    = identity,
    cry    = defaultLogger,
    logger = defaultLogger
  } = opts

  const connected = (socket, done) => {
    const { session } = socket.handshake.query

    const addMeta = pipe(
      unless(
        path(['meta', 'session']),
        assocPath(['meta', 'session'], session)
      ),
      assocPath(['meta', 'socket'], socket)
    )

    const handleAction = (axn, send=identity) =>
      Promise.resolve(axn)
        .then(tap(logger))
        .then(addMeta)
        .then(app)
        .catch(wrapError(axn))
        .then(formatErrors)
        .then(cleanMeta)
        .then(send)

    socket.on('action', handleAction)
    socket.on('error', cry)
    done()
  }

  const sob = axn => err =>
    cry(Object.assign(err, { axn }))

  const wrapError = axn =>
    when(is(Error), compose(error(axn.type), tap(sob(axn))))

  return connected
}

module.exports = curry(mount)
