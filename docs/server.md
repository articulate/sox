# Server API

| Function | Signature |
| -------- | --------- |
| [`action`](#action) | `String -> a -> Action` |
| [`error`](#error) | `String -> Error -> Action` |
| [`handle`](#handle) | `{ k: (Action -> Promise Action) } -> Action -> Promise Action` |
| [`join`](#join) | `(Action -> String) -> Action -> Action` |
| [`leave`](#leave) | `(Action -> String) -> Action -> Action` |
| [`logger`](#logger) | `a -> a` |
| [`mount`](#mount) | `{ k: v } -> (Socket, Function) -> ()` |
| [`overPayload`](#overpayload) | `(a -> Promise b) -> Action -> Promise Action` |
| [`to`](#to) | `(Action -> String) -> Action -> Action` |

The type `Action` above refers to an [FSA-compliant](https://github.com/redux-utilities/flux-standard-action) action of the shape `{ type, payload, meta }`.

### action

```haskell
action :: String -> a -> Action
```

Curried action creator.  Accepts a `String` for the `type`, and anything for the `payload`, and then returns an [FSA-compliant](https://github.com/acdlite/flux-standard-action) action with the format `{ type, payload }`.

See also [`error`](#error), [`handle`](#handle).

```js
const { action } = require('@articulate/sox')

action('TOGGLE', 42) //=> { type: 'TOGGLE', payload: 42 }

const sendEmail = action('SEND_EMAIL')
sendEmail({ to: 'example@email.com' }) //=> { type: 'SEND_EMAIL', payload: { to: 'example@email.com' } }
```

### error

```haskell
error :: String -> a -> Action
```

Curried error-action creator.  Accepts a `String` for the `type`, and anything for the `payload`, and then returns an [FSA-compliant](https://github.com/acdlite/flux-standard-action) action representing an error with the format `{ type, payload, error: true }`.

See also [`action`](#action), [`handle`](#handle).

```js
const { error } = require('@articulate/sox')

error('FETCH_USER', new Error('fetch failed')) //=> { type: 'FETCH_USER', payload: Error(...), error: true }

const sendEmail = error('SEND_EMAIL')
sendEmail(new Error('mailbox full')) //=> { type: 'SEND_EMAIL', payload: Error(...), error: true }
```

### handle

```haskell
handle :: { k: (Action -> Promise Action) } -> Action -> Promise Action
```

Accepts a map of action types to unary handler functions.  Returns an `app` handler function suitable for use with [`mount`](#mount).

The correct handler function will be chosen based on the `type` of an incoming action, and will then be called with that action.  Lifts each handler into a `Promise` chain, and rejects with a [`Boom.notFound`](https://github.com/hapijs/boom/#boomnotfoundmessage-data) error if no handler is found for the given action `type`.

See also [`mount`](#mount), [`overPayload`](#overpayload).

```js
const { handle, mount } = require('@articulate/sox')

const courses = require('../db/courses')

const {
  DEL_COURSE,
  GET_COURSE,
  PUT_COURSE
} = require('../actions/courses')

const app = handle({
  [ DEL_COURSE ]: courses.delCourse,
  [ GET_COURSE ]: courses.getCourse,
  [ PUT_COURSE ]: courses.putCourse
})
```

### join

```haskell
join :: (Action -> String) -> Action -> Action
```

Accepts a room function and an action.  The room function is used to translate the action into a room identifier.  The [`action.meta.socket`](#mount) is then [joined to the room](http://devdocs.io/socketio/rooms-and-namespaces#rooms), and the action is passed through.

See also [`leave`](#leave), [`mount`](#mount), [`to`](#to).

```js
const { handle, join, overPayload } = require('@articulate/sox')
const { pipeP } = require('ramda')

const courses = require('../db/courses')
const { GET_COURSE } = require('../actions/courses')

const courseRoom = axn =>
  `courses/${axn.payload.id}`

const getCourse =
  pipeP(
    overPayload(courses.getCourse),
    join(courseRoom)
  )

const app = handle({
  [ GET_COURSE ]: getCourse
})
```

### leave

```haskell
leave :: (Action -> String) -> Action -> Action
```

Accepts a room function and an action.  The room function is used to translate the action into a room identifier.  The [`action.meta.socket`](#mount) is then [removed from the room](http://devdocs.io/socketio/rooms-and-namespaces#rooms), and the action is passed through.

See also [`join`](#join), [`mount`](#mount), [`to`](#to).

```js
const { handle, leave, overPayload } = require('@articulate/sox')
const { pipeP } = require('ramda')

const courses = require('../db/courses')
const { DEL_COURSE } = require('../actions/courses')

const courseRoom = axn =>
  `courses/${axn.payload.id}`

const delCourse =
  pipeP(
    overPayload(courses.delCourse),
    leave(courseRoom)
  )

const app = handle({
  [ DEL_COURSE ]: delCourse
})
```

### logger

```haskell
logger :: a -> a
```

General purpose `JSON` logger for use with `sox`.  Used as the default `cry` and `logger` options in [`mount`](#mount).

Cleans errors to just `{ message, name, stack }`, and cleans the injected [`action.meta.socket`](#mount) (because that would be silly to log).

See also [`mount`](#mount).

```js
// server/lib/logger.js (example custom logger)

const { compose, dissocPath } = require('ramda')
const { logger } = require('@articulate/sox')

module.exports =
  compose(logger, dissocPath(['meta', 'token']))
```

```js
// server/sockets/index.js

const io = require('socket.io')
const { mount } = require('@articulate/sox')
const { tap } = require('ramda')

const app = require('./app')
const logger = require('../lib/logger')

const sockets = server =>
  io(server).use(mount({ app, logger }))

module.exports = tap(sockets)
```

### overPayload

```haskell
overPayload :: (a -> Promise b) -> Action -> Promise Action
```

Accepts an async function, and returns a handler function.  Intended to help simplify doing work just over the action payload, such that important bits kept in the `meta` (like `session` and `socket`) aren't lost in transit.

Usage is equivalent to both of the following:

```js
const handler =
  evolveP({ payload: theActualHandler })

const handler =
  overP(lensProp('payload'), theActualHandler)
```

See also [`handle`](#handle).

```js
const { handle, overPayload } = require('@articulate/sox')
const { pipeP } = require('ramda')

const { GET_PROFILE } = require('../actions/profiles')
const profiles = require('../services/profiles')

const getProfile =
  overPayload(profiles.getProfile)

const app = handle({
  [ GET_PROFILE ]: getProfile
})
```

### to

```haskell
to :: (Action -> String) -> Action -> Action
```

Accepts a room function and an action.  The room function is used to translate the action into a room identifier.  An `'action'` event with the action is then [broadcast to all sockets in that room](http://devdocs.io/socketio/rooms-and-namespaces#rooms) (with the exception of the [`action.meta.socket`](#mount)).  Finally, the action is passed through.

To broadcast to all sockets in a room from code outside the `sox` request/reponse cycle, set the `action.meta.socket` to a [`socket.io-emitter`](https://yarnpkg.com/en/package/socket.io-emitter).

See also [`join`](#join), [`leave`](#leave), [`mount`](#mount).

```js
const { handle, overPayload, to } = require('@articulate/sox')
const { pipeP } = require('ramda')

const { courses } = require('../db/courses')
const { PUT_COURSE } = require('../action/courses')

const courseRoom = axn =>
  `courses/${axn.payload.id}`

const putCourse =
  pipeP(
    overPayload(courses.putCourse),
    to(courseRoom)
  )

const app = handle({
  [ PUT_COURSE ]: putCourse
})
```
