const { assocWith, convergeP } = require('@articulate/funky')
const { identity, pipe, prop, reverse } = require('ramda')
const tinygen = require('tinygen')

const db = require('../lib/db')
const timestamp = require('../lib/timestamp')

const key = ({ room, sent }) =>
  `messages:${room}:${sent}:${tinygen(4)}`

const load = ({ room }) =>
  db.fetch({
    keys: false,
    limit: 200,
    lte: key({ room, sent: Date.now() + 5000 }),
    reverse: true
  }).then(reverse)

const put =
  pipe(
    timestamp('sent'),
    assocWith('key', key),
    convergeP(db.put, [ prop('key'), identity ])
  )

module.exports = { load, put }
