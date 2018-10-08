# Migration Guide

This guide is intended to help with upgrading to new major versions of `@articulate/sox`.

## Upgrading to v1

### Breaking Changes

Setup is no longer required for `@articulate/sox`.  All functions are exported as "static" functions.  This also means that "sox middleware", as originally implemented to handle instrumentation and error reporting, is no longer supported.

The [`handle`](../server.md#handle) function is no longer the focal point of the server-side architecture.  Much of its wrapping and lifting functionality has moved to the new [`mount`](../server.md#mount) function, and [`handle`](../server.md#handle) now returns an action handler, rather than a `socket.io` event callback.  It also now passes the entire action to sub-handlers.

The `unlock` function has been removed.  As far as I can tell, it hasn't been used by anyone, and I'm convinced that it's a poor design pattern anyways.

Steps to migrate your existing application are as follows:

1. [Stop instantiating `@articulate/sox`](#1-stop-instantiating-articulatesox)
2. [Stop directly logging the `'action'` and `'error'` events](#2-stop-directly-logging-the-action-and-error-events)
3. [Reorganize to use the new `handle` correctly](#3-reorganize-to-use-the-new-handle-correctly)
4. [Decide how you want to auth](#4-decide-how-you-want-to-auth)
5. [Instrument with `@articulate/sox-newrelic`](#5-instrument-with-articulatesox-newrelic)

- - -

#### 1. Stop instantiating `@articulate/sox`

Just destructure the functions you need directly off the module.

**Before:**

```js
// server/lib/sox.js
const { soxMiddleware } = require('./glue')
module.exports = require('@articulate/sox')({ middleware: soxMiddleware })

// server/sockets/courses.js
const { join, to } = require('../lib/sox')
```

**After:**

```js
// server/sockets/courses.js
const { join, to } = require('@articulate/sox')
```

#### 2. Stop directly logging the `'action'` and `'error'` events

These are now configured by the `cry` and `logger` options for the [`mount`](../server.md#mount) function, and both default to the [`logger`](../server.md#logger) function supplied by `@articulate/sox`.

**Before:**

```js
// server/sockets/debug.js
const { cry, logger } = require('../lib/glue')

module.exports = (socket, next) => {
  socket.on('action', logger)
  socket.on('error', cry)
  next()
}

// server/sockets/index.js
const io = require('socket.io')
const { tap } = require('ramda')

const m = require('require-dir')()

const sockets = server =>
  io(server)
    .use(m.debug)
    .use(m.otherThings)
    // etc.

module.exports = tap(sockets)
```

**After:**

```js
// server/sockets/index.js
const io = require('socket.io')
const { mount } = require('@articulate/sox')
const { tap } = require('ramda')

const cry = require('../lib/cry')       // only if you have
const logger = require('../lib/logger') // custom implementations

const app = /* See step 3 for building the `app` */

const sockets = server =>
  io(server).use(mount({ app, cry, logger }))

module.exports = tap(sockets)
```

#### 3. Reorganize to use the new `handle` correctly

The [`handle`](../server.md#handle) function now returns an action handler suitable for use as the `app` option for the [`mount`](../server.md#mount) function.  So you can either register all of your action types in one file, or split them up into separate modules, similar to below.

Note also that [`handle`](../server.md#handle) now passes the entire action to your handlers, each of which are expected to resolve with a response action, not just the response `payload`.  The [`overPayload`](../server.md#overpayload) helper is available if you just want to do work over the `payload`.

**Before:**

```js
// server/sockets/courses.js
const { composeP } = require('ramda')
const Joi = require('joi')
const { validate } = require('@articulate/funky')

const courses = require('../db/courses')
const { GET_COURSE } = require('../actions/courses')
const { handle } = require('../lib/sox')

const getSchema = Joi.object({
  id: Joi.string().required()
}).required()

module.exports = (socket, next) => {
  const getCourse =
    composeP(courses.getcourse, validate(getSchema))

  socket.on('action', handle({
    [ GET_COURSE ]: getCourse
  }))

  next()
}

// server/sockets/index.js
const io = require('socket.io')
const { tap } = require('ramda')

const m = require('require-dir')()

const sockets = server =>
  io(server)
    .use(m.courses)
    // etc.

module.exports = tap(sockets)
```

**After:**

```js
// server/sockets/courses.js
const { composeP } = require('ramda')
const Joi = require('joi')
const { overPayload } = require('@articulate/sox')
const { validate } = require('@articulate/funky')

const courses = require('../db/courses')
const { GET_COURSE } = require('../actions/courses')

const getSchema = Joi.object({
  id: Joi.string().required()
}).required()

const getCourse =
  overPayload(
    composeP(courses.getcourse, validate(getSchema))
  )

module.exports = {
  [ GET_COURSE ]: getCourse
}

// server/sockets/index.js
const { compose, mergeAll, values } = require('ramda')
const io = require('socket.io')
const { handle, mount } = require('@articulate/sox')
const { tap } = require('ramda')

const actions = require('require-dir')()

const app = compose(handle, mergeAll, values)(actions)

const sockets = server =>
  io(server).use(mount({ app }))

module.exports = tap(sockets)
```

#### 4. Decide how you want to auth

Previously, the recommended way to authenticate a socket connection was to do it once in the first `socket.io` middleware, continuing the middleware chain on success or disconnecting the socket on failure, similar to below.

**Before:**

```js
// server/sockets/auth.js
const { nAry } = require('ramda')

module.exports = (socket, next) => {
  const failure = err => {
    socket.disconnect()
    next(err)
  }

  const success = userData => {
    Object.assign(socket, userData)
    next()
  }

  authenticate(socket.handshake.cookie)
    .then(success)
    .catch(failure)
}

// server/sockets/index.js
const io = require('socket.io')
const { tap } = require('ramda')

const m = require('require-dir')()

const sockets = server =>
  io(server)
    .use(m.auth)
    .use(m.courses)
    // etc.

module.exports = tap(sockets)
```

The shortest path to migration would be to just keep it that way.  There's nothing in the new `@articulate/sox` to prevent you from continuing to use an `auth` middleware, like this:

**After:**

```js
// server/sockets/index.js
const { compose, dissoc, mergeAll, values } = require('ramda')
const io = require('socket.io')
const { handle, mount } = require('@articulate/sox')
const { tap } = require('ramda')

const actions = dissoc('auth', require('require-dir')())
const auth = require('./auth')

const app = compose(handle, mergeAll, values)(actions)

const sockets = server =>
  io(server)
    .use(auth)
    .use(mount({ app }))

module.exports = tap(sockets)
```

You may alternatively authenticate every action individually via composition, inspecting a `meta.jwt` or `meta.token` property each time.  In addition to the sweet savor of functional purity this would bring, it would also support the correct handling of authentication tokens which are periodically refreshed.  However, authenticating ever action would require changes to the frontend, and as this upgrade is intend to be backwards compatible with the frontend, I'll leave the implementation of this strategy as an exercise for the reader.

#### 5. Instrument with `@articulate/sox-newrelic`

Since the concept of "sox middleware" is no longer supported, then the previous method of instrumentation will no longer work.  If you would like to continue instrumenting with `New Relic`, then switch to using [`@articulate/sox-newrelic`](https://github.com/articulate/sox-newrelic), and follow the instructions provided.
