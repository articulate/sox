const {
  compose, curry, identity, map, merge, pick, pipe, prop, reduceRight, tap
} = require('ramda')

const { action, error } = require('@articulate/ducks')
const { reject } = require('@articulate/funky')

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

const makeTransformFn = transformations => axn =>
  new Promise(resolve => {
    const doTransform = reduceRight(
      (fn, next) => axn => fn(axn, next),
      resolve,
      transformations
    )
    return doTransform(axn)
  })

const handle = ({ middleware=[], transformations=[] }) => {
  const transform = makeTransformFn(transformations)
  const flow = compose(calm, ...middleware, send(transform))

  // handle : { k: (a -> Promise b) } -> (Action, Function) -> Promise Action
  return compose(handleWith, map(flow))
}

const handleWith = handlers => (axn, respond=identity) =>
  handlers[axn.type] && handlers[axn.type](merge(axn, { respond }))

const send = curry((transform, next, axn) => {
  const { type, respond } = axn
  return Promise.resolve(axn)
    .then(transform)
    .then(prop('payload'))
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
})

module.exports = handle
