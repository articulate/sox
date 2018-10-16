const { dissocPath, prop } = require('ramda')
const { expect } = require('chai')
const property   = require('prop-factory')
const spy        = require('@articulate/spy')

const { action, to } = require('..')

const room = prop('payload')

describe('to', () => {
  const axn  = action('TEST', 'foo')
  const res  = property()

  const io = {
    emit: spy(),
    to:   spy()
  }

  io.broadcast = io

  const socket = {
    emit: spy(),
    to:   spy()
  }

  socket.broadcast = socket

  axn.meta = { socket }

  afterEach(() => {
    io.emit.reset()
    io.to.reset()
    socket.emit.reset()
    socket.to.reset()
  })

  describe('called with just a room function', () => {
    beforeEach(() =>
      Promise.resolve(axn)
        .then(to(room))
        .then(res)
    )

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

  describe('called with a socket.io-emitter and a room function', () => {
    beforeEach(() =>
      Promise.resolve(axn)
        .then(to(io, room))
        .then(res)
    )

    it('broadcasts to the room', () =>
      expect(io.to.calls[0][0]).to.equal('foo')
    )

    it('emits an action', () =>
      expect(io.emit.calls[0])
        .to.eql(['action', dissocPath(['meta', 'socket'], axn)])
    )

    it('does not broadcast on action.meta.socket', () =>
      expect(socket.emit.calls.length).to.equal(0)
    )

    it('taps to pass through the action', () =>
      expect(res()).to.equal(axn)
    )
  })
})
