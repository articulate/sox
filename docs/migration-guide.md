# Migration Guide

This guide is intended to help with upgrading to new major versions of `@articulate/sox`.

## Upgrading to v1

### Breaking Changes

Setup is no longer required for `@articulate/sox`.  All functions are exported as "static" functions.  This also means that "sox middleware", as originally implemented to handle instrumentation and error reporting, is no longer supported.

The [`handle`](../server.md#handle) function is no longer the focal point of the server-side architecture.  Much of its wrapping and lifting functionality has moved to the new [`mount`](../server.md#mount) function, and [`handle`](../server.md#handle) now returns an action handler, rather than a `socket.io` event callback.  It also now passes the entire action to sub-handlers.

The `unlock` function has been removed.  As far as I can tell, it hasn't been used by anyone, and I'm convinced that it's a poor design pattern anyways.

Steps to migrate your existing application are as follows:

#### 1. Stop instantiating `@articulate/sox`.

Just destructure the functions you need directly off the module.

Before:
```js
// server/lib/sox.js
const { soxMiddleware } = require('./glue')
module.exports = require('@articulate/sox')({ middleware: soxMiddleware })

// server/sockets/resource.js
const { join, to } = require('../lib/sox')
```
After:
```js
// server/sockets/resource.js
const { join, to } = require('@articulate/sox')
```

#### 2. Stop directly logging the `'action'` and `'error'` events.

These are now configured by the `cry` and `logger` options for the [`mount`](../server.md#mount) function, and both default to the [`logger`](../server.md#logger) function supplied by `@articulate/sox`.

Before:
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
    .use(m.otherThings) // etc.

module.exports = tap(sockets)
```
After:
```js
// server/sockets/index.js
const io = require('socket.io')
const { mount } = require('@articulate/sox')
const { tap } = require('ramda')

const cry = require('../lib/cry')
const logger = require('../lib/logger')

const app = /* See step 3 for building the `app` */

const sockets = server =>
  io(server).use(mount({ app, cry, logger }))

module.exports = tap(sockets)
```
