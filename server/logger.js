const { is, pick, pipe, tap, when } = require('ramda')

const cleanMeta = require('./cleanMeta')

const cleanErrors =
  when(is(Error), pick(['message', 'name', 'stack']))

// logger :: a -> a
const logger =
  tap(
    pipe(
      cleanErrors,
      cleanMeta,
      JSON.stringify,
      console.info
    )
  )

module.exports = logger
