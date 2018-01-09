const { boomify } = require('boom')
const { path, pipe, prop, unless } = require('ramda')

const formatError = ({ data, message, error: name, statusCode: status }) =>
  ({ data, message, name, status })

const fromError = pipe(
  unless(prop('isBoom'), boomify),
  path(['output', 'payload']),
  formatError
)

module.exports = fromError

