const { expect } = require('chai')
const { prop }   = require('ramda')
const property   = require('prop-factory')
const spy        = require('@articulate/spy')

const { to } = require('..')()

const room = prop('foo')

describe('to', () => {
  const payload = { foo: 'bar' }
  const res     = property()
  const type    = 'TYPE'

  const socket = {
    emit: spy(),
    to:   spy()
  }

  socket.broadcast = socket

  beforeEach(() =>
    Promise.resolve(payload)
      .then(to(socket, room, type))
      .then(res)
  )

  afterEach(() => {
    socket.emit.reset()
    socket.to.reset()
  })

  it('broadcasts to the room', () =>
    expect(socket.to.calls[0][0]).to.equal('bar')
  )

  it('emits an action', () =>
    expect(socket.emit.calls[0]).to.eql(['action', { type, payload }])
  )

  it('taps to pass through the payload', () =>
    expect(res()).to.equal(payload)
  )
})
