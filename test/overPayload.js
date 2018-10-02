const { expect }  = require('chai')
const property    = require('prop-factory')
const { toUpper } = require('ramda')

const { action, overPayload } = require('..')

describe('overPayload', () => {
  const axn = action('TYPE', 'payload')
  const res = property()

  beforeEach(() =>
    overPayload(toUpper, axn).then(res)
  )

  it('maps a handler function over just the action payload', () =>
    expect(res()).to.eql({ type: 'TYPE', payload: 'PAYLOAD' })
  )
})
