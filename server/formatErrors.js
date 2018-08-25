const { boomify, badRequest } = require('boom')

const {
  converge, evolve, identity, is, pipe, prop, unless, when
} = require('ramda')

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
    converge(badRequest, [ prop('message'), identity ])
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
