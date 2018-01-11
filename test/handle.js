const { action } = require('@articulate/ducks')
const Boom       = require('boom')
const { expect } = require('chai')
const property   = require('prop-factory')
const spy        = require('@articulate/spy')
const { createSandbox, match } = require('sinon')

const { assoc, curry } = require('ramda')

const sandbox = createSandbox()
const log = property()

const logging = curry((next, data) =>
  Promise.resolve(data)
    .then(next)
    .then(log)
)

const { handle } = require('..')({ middleware: [ logging ] })

describe('handle', () => {
  let db

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
    throw new Error('foobar')
  }

  const handler = handle({
    BAD_REQUEST: badRequest,
    GET_USER:  get,
    HORRIBLE_ERROR: horribleError,
    NOT_FOUND: notFound,
    PUT_USER:  put,
  })

  before(() =>
    sandbox.stub(console, 'error')
  )

  beforeEach(() => {
    db = {
      a: { id: 'a', name: 'Johny', flag: true },
      b: { id: 'b', name: 'Katie', flag: true }
    }
  })

  afterEach(() => {
    log(undefined)
    sandbox.resetHistory()
  })

  after(() =>
    console.error.restore()
  )

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
      expect(console.error).not.to.have.been.called
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
      expect(console.error).not.to.have.been.called
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
      expect(console.error).to.have.been.calledOnce
        .and.to.have.been.calledWith(match(Error))
        .and.to.have.been.calledWith(match({ message: 'Not Found' }))
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
      expect(console.error).to.have.been.calledOnce
        .and.to.have.been.calledWith(match(Error))
        .and.to.have.been.calledWith(match({ message: 'Bad Request' }))
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
          message: 'An internal server error occurred',
          name: 'Internal Server Error',
          status: 500,
        },
        error: true
      })
      expect(console.error).to.have.been.calledOnce
        .and.to.have.been.calledWith(match(Error))
        .and.to.have.been.calledWith(match({ message: 'foobar' }))
    })
  })
})
