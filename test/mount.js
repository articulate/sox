const { badRequest } = require('boom')
const { evolve, toLower } = require('ramda')
const { expect } = require('chai')
const Joi = require('joi')
const property = require('prop-factory')
const spy = require('@articulate/spy')
const { validate } = require('@articulate/funky')

const { handle, mount } = require('..')

const Socket = () => {
  const handlers = {}
  const handshake = { query: { session: 'session' } }

  const emit = (type, data) =>
    new Promise(res =>
      handlers[type](data, res)
    )

  const emitSync = (type, data) => {
    handlers[type](data)
  }

  const on = (type, handler) =>
    handlers[type] = handler

  return { emit, emitSync, handshake, on }
}

const wait = delay =>
  new Promise(res => setTimeout(res, delay))

describe('mount', () => {
  const axn = { type: 'TYPE', payload: 'PAYLOAD', meta: {} }
  const res = property()

  describe('with no options', () => {
    const socket = Socket()

    before(done =>
      mount()(socket, done)
    )

    beforeEach(() =>
      socket.emit('action', axn).then(res)
    )

    it('defaults the app to identity', () =>
      expect(res()).to.eql(axn)
    )

    it('defaults logger to sox.logger', () => {
      expect(console.info.calls.length).to.equal(1)
      expect(console.info.calls[0]).to.eql([ JSON.stringify(axn) ])
    })
  })

  describe('with app specified', () => {
    const app = handle({
      TYPE: evolve({ payload: toLower })
    })

    const socket = Socket()

    before(done =>
      mount({ app })(socket, done)
    )

    beforeEach(() =>
      socket.emit('action', axn).then(res)
    )

    it('uses the app to handle the action', () =>
      expect(res().payload).to.equal('payload')
    )
  })

  describe('when errors occur', () => {
    const app = handle({
      TYPE: () => { throw badRequest() }
    })

    describe('with no cry specified', () => {
      const socket = Socket()

      before(done =>
        mount({ app })(socket, done)
      )

      beforeEach(() =>
        socket.emit('action', axn)
      )

      it('cries with sox.logger', () => {
        expect(console.info.calls.length).to.equal(2)
        const logged = JSON.parse(console.info.calls[1][0])
        expect(logged).to.include({ message: 'Bad Request', name: 'Error' })
        expect(logged.stack).to.exist
      })
    })

    describe('with cry specified', () => {
      const cry = spy()
      const socket = Socket()

      before(done =>
        mount({ app, cry })(socket, done)
      )

      beforeEach(() =>
        socket.emit('action', axn)
      )

      afterEach(() =>
        cry.reset()
      )

      it('cries with the specified crier', () => {
        expect(cry.calls.length).to.equal(1)
        expect(cry.calls[0][0]).to.be.an('Error')
      })
    })

    describe('with a Boom error', () => {
      const socket = Socket()

      before(done =>
        mount({ app })(socket, done)
      )

      beforeEach(() =>
        socket.emit('action', axn).then(res)
      )

      it('formats an error response action', () => {
        expect(res().type).to.equal('TYPE')
        expect(res().payload).to.include({
          message: 'Bad Request',
          name: 'Bad Request',
          status: 400
        })
        expect(res().error).to.be.true
      })
    })

    describe('with a Joi error', () => {
      const schema = Joi.object({
        payload: Joi.number()
      }).unknown()

      const app = handle({
        TYPE: validate(schema)
      })

      const socket = Socket()

      before(done =>
        mount({ app })(socket, done)
      )

      beforeEach(() =>
        socket.emit('action', axn).then(res)
      )

      it('formats an error response action', () => {
        expect(res().type).to.equal('TYPE')
        expect(res().payload).to.include({
          message: '"payload" must be a number',
          name: 'Bad Request',
          status: 400
        })
        expect(res().error).to.be.true
      })
    })

    describe('with a system error', () => {
      const app = handle({
        TYPE: () => { throw new Error('oops') }
      })

      const socket = Socket()

      before(done =>
        mount({ app })(socket, done)
      )

      beforeEach(() =>
        socket.emit('action', axn).then(res)
      )

      it('formats an error response action', () => {
        expect(res().type).to.equal('TYPE')
        expect(res().payload).to.include({
          message: 'oops',
          name: 'Internal Server Error',
          status: 500
        })
        expect(res().error).to.be.true
      })
    })
  })

  describe('when action sent not as request/response', () => {
    const app = spy()
    const socket = Socket()

    before(done =>
      mount({ app })(socket, done)
    )

    beforeEach(() => {
      socket.emitSync('action', axn)
      return wait(250)
    })

    afterEach(() =>
      app.reset()
    )

    it('still safely calls app', () => {
      expect(app.calls.length).to.equal(1)
      expect(app.calls[0][0].type).to.equal('TYPE')
      expect(app.calls[0][0].payload).to.equal('PAYLOAD')
    })
  })

  describe('supplemental meta', () => {
    const app = property()
    const socket = Socket()

    before(done =>
      mount({ app })(socket, done)
    )

    beforeEach(() =>
      socket.emit('action', axn)
    )

    it('includes the session', () =>
      expect(app().meta).to.include({ session: 'session' })
    )

    it('includes the socket', () =>
      expect(app().meta).to.include({ socket })
    )
  })
})
