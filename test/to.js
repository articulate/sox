const { dissocPath, prop } = require('ramda')
const { expect } = require('chai')
const property   = require('prop-factory')
const spy        = require('@articulate/spy')

const { action, to } = require('..')

const room = prop('payload')

describe('to', () => {
  const axn  = action('TEST', 'foo')
  const res  = property()

  const socket = {
    emit: spy(),
    to:   spy()
  }

  socket.broadcast = socket

  axn.meta = { socket }

  beforeEach(() =>
    Promise.resolve(axn)
      .then(to(room))
      .then(res)
  )

  afterEach(() => {
    socket.emit.reset()
    socket.to.reset()
  })

  it('broadcasts to the room', () =>
    expect(socket.to.calls[0][0]).to.equal('foo')
  )

  it('emits an action', () =>
    expect(socket.emit.calls[0])
      .to.eql(['action', dissocPath(['meta', 'socket'], axn)])
  )

  it('taps to pass through the action', () =>
    expect(res()).to.equal(axn)
  )
})
