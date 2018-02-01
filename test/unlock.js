const { expect } = require('chai')
const property   = require('prop-factory')
const spy        = require('@articulate/spy')

const { unlock } = require('..')()

describe('unlock', () => {
  const res    = property()
  const socket = { on: spy() }

  const foo = (socket, next) => {
    socket.on('foo', Function.prototype)
    next()
  }

  const bar = (socket, next) => {
    socket.on('bar', Function.prototype)
    next()
  }

  const brokeCallback = (socket, next) => {
    next(new Error('broke'))
  }

  const brokeThrown = () => {
    throw new Error('broke')
  }

  afterEach(() => {
    res(undefined)
    socket.on.reset()
  })

  describe('when secure middlewares work', () => {
    beforeEach(() =>
      Promise.resolve('blah')
        .then(unlock(socket, [ foo, bar ]))
        .then(res)
    )

    it('unlocks the middlewares', () => {
      expect(socket.on.calls[0][0]).to.equal('foo')
      expect(socket.on.calls[1][0]).to.equal('bar')
    })

    it('taps to pass-thru', () =>
      expect(res()).to.equal('blah')
    )
  })

  describe('when middlewares fail by callback', () => {
    beforeEach(() =>
      Promise.resolve('blah')
        .then(unlock(socket, [ foo, brokeCallback, bar ]))
        .catch(res)
    )

    it('rejects correctly', () => {
      expect(socket.on.calls.length).to.equal(1)
      expect(socket.on.calls[0][0]).to.equal('foo')
      expect(res()).to.be.an('error')
    })
  })

  describe('when middlewares fail by throw', () => {
    beforeEach(() =>
      Promise.resolve('blah')
        .then(unlock(socket, [ foo, brokeThrown, bar ]))
        .catch(res)
    )

    it('rejects correctly', () => {
      expect(socket.on.calls.length).to.equal(1)
      expect(socket.on.calls[0][0]).to.equal('foo')
      expect(res()).to.be.an('error')
    })
  })
})
