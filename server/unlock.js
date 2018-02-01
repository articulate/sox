const {
  compose, curry, flip, map, nAry, once, partial, pipeP
} = require('ramda')

const { promisify, tapP } = require('@articulate/funky')

// unlock :: Socket -> [ Function ] -> a -> Promise a
const unlock = (socket, middleware) => {
  const convert = compose(nAry(0), flip(partial)([ socket ]), promisify)

  return tapP(once(pipeP(...map(convert, middleware))))
}

module.exports = curry(unlock)
