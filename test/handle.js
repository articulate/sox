const { action }   = require('@articulate/ducks')
const Boom         = require('boom')
const { expect }   = require('chai')
const property     = require('prop-factory')
const spy          = require('@articulate/spy')
const Joi          = require('joi')
const { validate } = require('@articulate/funky')

const { assoc, curry } = require('ramda')

const log = property()

const logging = curry((next, data) =>
  Promise.resolve(data)
    .then(next)
    .then(log)
)

const { handle } = require('..')({ middleware: [ logging ] })

describe('handle', () => {
  let db

  const restoreError = console.error

  const get = data =>
    db[data.id]

  const put = data =>
    db[data.id] = assoc('flag', true, data)

  const notFound = () => {
    throw Boom.notFound()
  }

  const badRequest = () => {
    const err = Boom.badRequest()
    err.output.payload.data = { foo: 'bar' }
    throw err
  }

  const horribleError = () => {
    throw new Error('Some horrible error')
  }

  const schema = Joi.object({
    foo: Joi.string().required()
  }).required()

  const joiError = validate(schema)

  const handler = handle({
    BAD_REQUEST: badRequest,
    GET_USER:  get,
    HORRIBLE_ERROR: horribleError,
    JOI_ERROR: joiError,
    NOT_FOUND: notFound,
    PUT_USER:  put,
  })

  beforeEach(() => {
    console.error = spy()
    db = {
      a: { id: 'a', name: 'Johny', flag: true },
      b: { id: 'b', name: 'Katie', flag: true }
    }
  })

  afterEach(() => {
    log(undefined)
    console.error = restoreError
  })

  describe('when socket.io wants a response', () => {
    const getUser = action('GET_USER', { id: 'a' })
    const respond = spy()

    beforeEach(() =>
      handler(getUser, respond)
    )

    it('responds with an action', () =>
      expect(respond.calls[0][0]).to.eql({
        type: 'GET_USER',
        payload: { id: 'a', name: 'Johny', flag: true }
      })
    )
  })

  describe('when socket.io does not want a response', () => {
    const putUser = action('PUT_USER', { id: 'c', name: 'Bobby' })
    const res     = property()

    beforeEach(() =>
      handler(putUser).then(res)
    )

    it('that\'s ok too', () => {
      expect(res()).to.eql({
        type: 'PUT_USER',
        payload: { id: 'c', name: 'Bobby', flag: true }
      })
      expect(console.error.calls.length).to.equal(0)
    })
  })

  describe('with middleware supplied', () => {
    const getUser = action('GET_USER', { id: 'a' })

    beforeEach(() =>
      handler(getUser)
    )

    it('runs the middleware', () => {
      expect(log()).to.eql({
        type: 'GET_USER',
        payload: { id: 'a', name: 'Johny', flag: true }
      })
      expect(console.error.calls.length).to.equal(0)
    })
  })

  describe('when it fails', () => {
    const notFound = action('NOT_FOUND', null)
    const respond  = spy()

    beforeEach(() =>
      handler(notFound, respond)
    )

    it('responds with an error action', () => {
      expect(respond.calls[0][0]).to.eql({
        type: 'NOT_FOUND',
        payload: {
          data: undefined,
          message: 'Not Found',
          name: 'Not Found',
          status: 404,
        },
        error: true
      })
      expect(console.error.calls.length).to.equal(1)
      expect(console.error.calls[0].length).to.equal(1)
      const err = JSON.parse(console.error.calls[0][0])
      expect(err).to.have.property('name', 'Error')
      expect(err).to.have.property('message', 'Not Found')
      expect(err).to.have.property('stack').that.is.a('string')
    })
  })

  describe('when it fails with data', () => {
    const notFound = action('BAD_REQUEST', null)
    const respond  = spy()

    beforeEach(() =>
      handler(notFound, respond)
    )

    it('responds with an error action', () => {
      expect(respond.calls[0][0]).to.eql({
        type: 'BAD_REQUEST',
        payload: {
          data: { foo: 'bar' },
          message: 'Bad Request',
          name: 'Bad Request',
          status: 400,
        },
        error: true
      })
      expect(console.error.calls.length).to.equal(1)
      expect(console.error.calls[0].length).to.equal(1)
      const err = JSON.parse(console.error.calls[0][0])
      expect(err).to.have.property('name', 'Error')
      expect(err).to.have.property('message', 'Bad Request')
      expect(err).to.have.property('stack').that.is.a('string')
    })
  })

  describe('when it fails with generic `Error`', () => {
    const notFound = action('HORRIBLE_ERROR', null)
    const respond  = spy()

    beforeEach(() =>
      handler(notFound, respond)
    )

    it('responds with an error action', () => {
      expect(respond.calls[0][0]).to.eql({
        type: 'HORRIBLE_ERROR',
        payload: {
          data: undefined,
          message: 'Some horrible error',
          name: 'Internal Server Error',
          status: 500,
        },
        error: true
      })
      expect(console.error.calls.length).to.equal(1)
      expect(console.error.calls[0].length).to.equal(1)
      const err = JSON.parse(console.error.calls[0][0])
      expect(err).to.have.property('name', 'Error')
      expect(err).to.have.property('message', 'Some horrible error')
      expect(err).to.have.property('stack').that.is.a('string')
    })
  })

  describe('when it fails with a joi error', () => {
    const joiError = action('JOI_ERROR', {})
    const respond  = spy()

    beforeEach(() =>
      handler(joiError, respond)
    )

    it('responds with bad request error action', () => {
      expect(respond.calls[0][0]).to.eql({
        type: 'JOI_ERROR',
        payload: {
          data: undefined,
          message: 'Bad Request',
          name: 'Bad Request',
          status: 400,
        },
        error: true,
      })
      expect(console.error.calls.length).to.equal(1)
      expect(console.error.calls[0].length).to.equal(1)
      const err = JSON.parse(console.error.calls[0][0])
      expect(err).to.have.property('name', 'ValidationError')
      expect(err).to.have.property(
        'message',
        'child "foo" fails because ["foo" is required]'
      )
      expect(err).to.have.property('stack').that.is.a('string')
    })
  })
})
