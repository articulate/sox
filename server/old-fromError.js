const { boomify, badRequest } = require('boom')
const { converge, identity, pipe, prop, unless, when } = require('ramda')

const formatError = err => {
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

const joiError = pipe(
  prop('details'),
  converge(badRequest, [ prop('message'), identity ])
)

const fromError = pipe(
  when(prop('isJoi'), joiError),
  unless(prop('isBoom'), boomify),
  formatError
)

module.exports = fromError
