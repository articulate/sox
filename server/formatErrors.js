const { boomify, badRequest } = require('boom')

const {
  compose, converge, evolve, identity, is, join,
  pipe, pluck, prop, unless, when
} = require('ramda')

const combinedMessage =
  compose(join(', '), pluck('message'))

const fromError = err => {
  const {
    message,
    output: {
      payload: {
        data,
        error: name,
        statusCode: status
      }
    }
  } = err

  return { data, message, name, status }
}

const joiError =
  pipe(
    prop('details'),
    converge(badRequest, [ combinedMessage, identity ])
  )

const formatError =
  pipe(
    when(prop('isJoi'), joiError),
    unless(prop('isBoom'), boomify),
    fromError
  )

// formatErrors :: Action -> Action
const formatErrors =
  evolve({ payload: when(is(Error), formatError) })

module.exports = formatErrors
