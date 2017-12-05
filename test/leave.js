const { expect } = require('chai')
const { prop }   = require('ramda')
const property   = require('prop-factory')
const spy        = require('@articulate/spy')

const { leave } = require('..')()

const room = prop('foo')

describe('leave', () => {
  const data   = { foo: 'bar' }
  const res    = property()
  const socket = { leave: spy() }

  beforeEach(() =>
    Promise.resolve(data)
      .then(leave(socket, room))
      .then(res)
  )

  afterEach(() =>
    socket.leave.reset()
  )

  it('joins the room', () =>
    expect(socket.leave.calls[0][0]).to.equal('bar')
  )

  it('taps to pass through the data', () =>
    expect(res()).to.equal(data)
  )
})
