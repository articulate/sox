const Async = require('crocks/Async')
const curry = require('ramda/src/curry')
const IO    = require('crocks/IO')
const max   = require('ramda/src/max')

// throttle : Number -> (a -> String) -> (a -> Async b) -> a -> IO Async b
const throttle = (wait, key, f) => {
  const cache = {}

  const call = id => {
    cache[id].last = Date.now()
    const { args, reject, resolve } = cache[id]
    f.apply(null, args).fork(reject, resolve)
    delete cache[id].args
    delete cache[id].timeout
  }

  const throttled = (...args) =>
    IO(() => {
      const id = key.apply(null, args)

      if (!cache[id]) {
        cache[id] = {}
        cache[id].async = Async((reject, resolve) => {
          Object.assign(cache[id], { reject, resolve })
        })
      }

      cache[id].args = args
      const delta = Date.now() - (cache[id].last || 0)

      if (!cache[id].timeout) {
        const delay = max(0, wait - delta)
        cache[id].timeout = setTimeout(call.bind(null, id), delay)
      }

      return cache[id].async
    })

  return throttled
}

module.exports = curry(throttle)
