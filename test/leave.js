const { expect } = require('chai')
const { prop }   = require('ramda')
const property   = require('prop-factory')
const spy        = require('@articulate/spy')

const { action, leave } = require('..')

const room = prop('payload')

describe('leave', () => {
  const axn    = action('TEST', 'foo')
  const res    = property()
  const socket = { leave: spy() }

  axn.meta = { socket }

  beforeEach(() =>
    Promise.resolve(axn)
      .then(leave(room))
      .then(res)
  )

  afterEach(() =>
    socket.leave.reset()
  )

  it('leaves the room', () =>
    expect(socket.leave.calls[0][0]).to.equal('foo')
  )

  it('taps to pass through the action', () =>
    expect(res()).to.equal(axn)
  )
})
