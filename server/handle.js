const { compose, curry, identity, map, pick, pipe, tap } = require('ramda')

const { action, error } = require('@articulate/ducks')
const { reject }        = require('@articulate/funky')

const fromError = require('./fromError')

const calm = curry((next, data) =>
  Promise.resolve(data)
    .then(next)
    .catch(pipe(
      pick([ 'message', 'name', 'stack' ]),
      JSON.stringify,
      console.error
    ))
)

const handle = ({ middleware=[] }) => {
  const flow = compose(calm, ...middleware, send)

  // handle : { k: (a -> Promise b) } -> (Action, Function) -> Promise Action
  return compose(handleWith, map(flow))
}

const handleWith = handlers => ({ type, payload }, respond=identity) =>
  handlers[type] && handlers[type]({ type, payload, respond })

const send = curry((next, { type, payload, respond }) =>
  Promise.resolve(payload)
    .then(next)
    .then(action(type))
    .then(tap(respond))
    .catch(pipe(
      tap(pipe(
        fromError,
        error(type),
        respond
      )),
      reject
    ))
)

module.exports = handle
