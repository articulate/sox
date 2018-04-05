const Boom = require('boom')
const { converge, identity, path, pipe, prop, unless, when } = require('ramda')

const { boomify } = Boom

const formatError = ({ data, message, error: name, statusCode: status }) =>
  ({ data, message, name, status })

const joiError = pipe(
  prop('details'),
  converge(Boom.badRequest, [ prop('message'), identity ])
)

const fromError = pipe(
  when(prop('isJoi'), joiError),
  unless(prop('isBoom'), boomify),
  path(['output', 'payload']),
  formatError
)

module.exports = fromError
