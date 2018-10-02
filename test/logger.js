const { expect } = require('chai')
const property   = require('prop-factory')

const { action, logger } = require('..')

describe('logger', () => {
  const axn = action('FOO', 'bar')
  const err = new Error('message')
  const res = property()

  axn.meta = { session: '123', socket: {} }

  describe('when logging an action', () => {
    beforeEach(() =>
      Promise.resolve(axn)
        .then(logger)
        .then(res)
    )

    it('cleans out the meta before stringifying and logging', () =>
      expect(console.info.calls[0])
        .to.eql(['{"type":"FOO","payload":"bar","meta":{"session":"123"}}'])
    )

    it('taps to pass thru the action', () =>
      expect(res()).to.eql(axn)
    )
  })

  describe('when logging an error', () => {
    beforeEach(() =>
      Promise.reject(err)
        .catch(logger)
        .then(res)
    )

    it('logs the message, name, and stack', () =>{
      expect(console.info.calls[0][0])
        .to.match(/{"message":"message","name":"Error","stack":/)
    })
  })
})
