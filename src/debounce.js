const Async = require('crocks/Async')
const curry = require('ramda/src/curry')
const IO    = require('crocks/IO')

// debounce : Number -> (a -> String) -> (a -> Async b) -> a -> IO Async b
const debounce = (wait, key, f) => {
  const cache = {}

  const debounced = (...args) =>
    IO(() => {
      const id = key.apply(null, args)

      if (!cache[id]) {
        cache[id] = {}
        cache[id].async = Async((reject, resolve) => {
          Object.assign(cache[id], { reject, resolve })
        })
      }

      clearTimeout(cache[id].timeout)

      cache[id].timeout = setTimeout(() => {
        const { reject, resolve } = cache[id]
        f.apply(null, args).fork(reject, resolve)
        delete cache[id]
      }, wait)

      return cache[id].async
    })

  return debounced
}

module.exports = curry(debounce)
