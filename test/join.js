const { expect } = require('chai')
const { prop }   = require('ramda')
const property   = require('prop-factory')
const spy        = require('@articulate/spy')

const { join } = require('..')()

const room = prop('foo')

describe('join', () => {
  const data   = { foo: 'bar' }
  const res    = property()
  const socket = { join: spy() }

  beforeEach(() =>
    Promise.resolve(data)
      .then(join(socket, room))
      .then(res)
  )

  afterEach(() =>
    socket.join.reset()
  )

  it('joins the room', () =>
    expect(socket.join.calls[0][0]).to.equal('bar')
  )

  it('taps to pass through the data', () =>
    expect(res()).to.equal(data)
  )
})
