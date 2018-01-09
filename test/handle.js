const { action } = require('@articulate/ducks')
const Boom       = require('boom')
const { expect } = require('chai')
const property   = require('prop-factory')
const spy        = require('@articulate/spy')

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

  const handler = handle({
    GET_USER:  get,
    NOT_FOUND: notFound,
    PUT_USER:  put,
    BAD_REQUEST: badRequest
  })

  beforeEach(() =>
    db = {
      a: { id: 'a', name: 'Johny', flag: true },
      b: { id: 'b', name: 'Katie', flag: true }
    }
  )

  afterEach(() =>
    log(undefined)
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

    it('that\'s ok too', () =>
      expect(res()).to.eql({
        type: 'PUT_USER',
        payload: { id: 'c', name: 'Bobby', flag: true }
      })
    )
  })

  describe('with middleware supplied', () => {
    const getUser = action('GET_USER', { id: 'a' })

    beforeEach(() =>
      handler(getUser)
    )

    it('runs the middleware', () =>
      expect(log()).to.eql({
        type: 'GET_USER',
        payload: { id: 'a', name: 'Johny', flag: true }
      })
    )
  })

  describe('when it fails', () => {
    const notFound = action('NOT_FOUND', null)
    const respond  = spy()

    beforeEach(() =>
      handler(notFound, respond)
    )

    it('responds with an error action', () =>
      expect(respond.calls[0][0]).to.eql({
        type: 'NOT_FOUND',
        payload: {
          message: 'Not Found',
          name: 'Not Found',
          status: 404,
          data: undefined,
        },
        error: true
      })
    )
  })

  describe('when it fails with data', () => {
    const notFound = action('BAD_REQUEST', null)
    const respond  = spy()

    beforeEach(() =>
      handler(notFound, respond)
    )

    it('responds with an error action', () =>
      expect(respond.calls[0][0]).to.eql({
        type: 'BAD_REQUEST',
        payload: {
          message: 'Bad Request',
          name: 'Bad Request',
          status: 400,
          data: { foo: 'bar' }
        },
        error: true
      })
    )
  })
})
