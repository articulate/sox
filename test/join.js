const { expect } = require('chai')
const { prop }   = require('ramda')
const property   = require('prop-factory')
const spy        = require('@articulate/spy')

const { action, join } = require('..')

const room = prop('payload')

describe('join', () => {
  const axn    = action('TEST', 'foo')
  const res    = property()
  const socket = { join: spy() }

  axn.meta = { socket }

  beforeEach(() =>
    Promise.resolve(axn)
      .then(join(room))
      .then(res)
  )

  afterEach(() =>
    socket.join.reset()
  )

  it('joins the room', () =>
    expect(socket.join.calls[0][0]).to.equal('foo')
  )

  it('taps to pass through the action', () =>
    expect(res()).to.equal(axn)
  )
})
