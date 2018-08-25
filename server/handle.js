const Boom = require('boom')
const { curry } = require('ramda')
const { reject, resolve } = require('@articulate/funky')

// handle :: { k: (Action -> Promise Action) } -> Action -> Promise Action
const handle = (handlers, axn) =>
  typeof handlers[axn.type] === 'function'
    ? resolve(axn).then(handlers[axn.type])
    : reject(Boom.notFound('action type not found', axn))

module.exports = curry(handle)
