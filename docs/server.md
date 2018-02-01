# Server API

| Function | Signature |
| -------- | --------- |
| [`handle`](#handle) | `{ k: (a -> Promise b) } -> (Action, Function) -> Promise Action` |
| [`join`](#join) | `Socket -> (a -> String) -> a -> a` |
| [`leave`](#leave) | `Socket -> (a -> String) -> a -> a` |
| [`to`](#to) | `Socket -> (a -> String) -> String -> a -> a` |
| [`unlock`](#unlock) | `Socket -> [ Function ] -> a -> Promise a` |

## Setup

To setup `@articulate/sox` in your service, simply provide the following options:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `middleware` | `[Middleware]` | `[]` | List of `@articulate/sox` middleware functions |

The signature of each `Middleware` function must be:

```haskell
Middleware :: Middleware -> { type, payload, respond } -> Promise b
```

The list of middleware will be executed LTR.  Each middleware may execute anything before or after the next middleware, as long as it's within a `Promise` chain.  For example, you might want to log incoming actions, and also notify an error aggregation service:

```js
const { compose, curry, tap } = require('ramda')
const { reject } = require('@articulate/funky')

const { cry } = require('../lib/errors')

const logActions = curry((next, data) =>
  Promise.resolve(data)
    .then(tap(console.log))
    .then(next)
)

const cryErrors = curry((next, data) =>
  Promise.resolve(data)
    .then(next)
    .catch(compose(reject, tap(cry)))
)

const middleware = [ logActions, cryErrors ]

module.exports = require('@articulate/sox')({ middleware })
```

Note that it's best to re-reject any caught errors, so that other middleware can catch them again.

## Functions

### handle

```haskell
handle :: { k: (a -> Promise b) } -> (Action, Function) -> Promise b
```

Accepts a mapping of [FSA-compliant](https://github.com/acdlite/flux-standard-action) action types to unary handler functions.  Returns a `socket.io` callback.  Lifts each handler into a `Promise` chain and wraps it with the [supplied middleware](#setup).

The correct handler function will be chosen based on the `type` of an incoming action, and will then be called with the `payload` of that action.  The resolved value of that handler will then be wrapped back up as an action of the same `type` and sent to the client as a response.

See also [`join`](#join), [`leave`](#leave), [`to`](#to).

```js
const courses         = require('../db/courses')
const { handle, to }  = require('../lib/sox')

const {
  DEL_COURSE,
  GET_COURSE,
  PUT_COURSE
} = require('../actions/courses')

module.exports = (socket, next) => {
  socket.on('action', handle({
    [ DEL_COURSE ]: courses.delCourse,
    [ GET_COURSE ]: courses.getCourse,
    [ PUT_COURSE ]: courses.putCourse
  }))

  next()
}
```

### join

```haskell
join :: Socket -> (a -> String) -> a -> a
```

Accepts a `socket` and a room function.  The room function is used to translate the incoming `payload` into a room identifier.  The `socket` is then [joined to the room](http://devdocs.io/socketio/rooms-and-namespaces#rooms), and the `payload` is passed through.

See also [`handle`](#handle), [`leave`](#leave), [`to`](#to).

```js
const { pipeP } = require('ramda')

const courses          = require('../db/courses')
const { GET_COURSE }   = require('../actions/courses')
const { handle, join } = require('../lib/sox')

const courseRoom = ({ id }) =>
  `courses/${id}`

module.exports = (socket, next) => {
  const getCourse = pipeP(
    courses.getCourse,
    join(socket, courseRoom)
  )

  socket.on('action', handle({
    [ GET_COURSE ]: getCourse
  }))

  next()
}
```

### leave

```haskell
leave :: Socket -> (a -> String) -> a -> a
```

Accepts a `socket` and a room function.  The room function is used to translate the incoming `payload` into a room identifier.  The `socket` is then [removed from the room](http://devdocs.io/socketio/rooms-and-namespaces#rooms), and the `payload` is passed through.

See also [`handle`](#handle), [`join`](#join), [`to`](#to).

```js
const { pipeP } = require('ramda')

const courses           = require('../db/courses')
const { DEL_COURSE }    = require('../actions/courses')
const { handle, leave } = require('../lib/sox')

const courseRoom = ({ id }) =>
  `courses/${id}`

module.exports = (socket, next) => {
  const delCourse = pipeP(
    courses.delCourse,
    leave(socket, courseRoom)
  )

  socket.on('action', handle({
    [ DEL_COURSE ]: delCourse
  }))

  next()
}
```

### to

```haskell
to :: Socket -> (a -> String) -> String -> a -> a
```

Accepts a `socket`, a room function, and an [FSA-compliant](https://github.com/acdlite/flux-standard-action) action `type`.  The room function is used to translate the incoming `payload` into a room identifier.  An `'action'` event with an action of `{ type, payload }` is then broadcast to all sockets.  Finally, the `payload` is passed through.

See also [`handle`](#handle), [`join`](#join), [`leave`](#leave).

```js
const { pipeP } = require('ramda')

const { courses }    = require('../db/courses')
const { PUT_COURSE } = require('../action/courses')
const { handle, to } = require('../lib/sox')

const courseRoom = ({ id }) =>
  `courses/${id}`

module.exports = (socket, next) => {
  const putCourse = pipeP(
    courses.putCourse,
    to(socket, courseRoom, PUT_COURSE)
  )

  socket.on('action', handle({
    [ PUT_COURSE ]: putCourse
  }))

  next()
}
```

### unlock

```haskell
unlock :: Socket -> [ Function ] -> a -> Promise a
```

Constructs a single-use function to unlock a list of secure [`socket.io` middleware](http://devdocs.io/socketio/server-api#namespace-use-fn-function-namespace) (not to be confused with [`@articulate/sox` middleware](#setup)).  Useful when you would like to expose some socket actions publicly, but only unlock others after the user has authenticated.

Wrapped with [`R.once`](http://devdocs.io/ramda/index#once) to avoid executing the secure middleware repeatedly.

```js
const Joi          = require('joi')
const { pipeP }    = require('ramda')
const { validate } = require('@articulate/funky')

const { AUTHENTICATE }   = require('../actions/auth')
const { handle, unlock } = require('../lib/sox')

const secureMiddleware = [
  require('./courses'),
  require('./lessons')
]

const authSchema = Joi.object({
  token: Joi.string().required()
}).required()

module.exports = (socket, next) => {
  const authenticate = pipeP(
    validate(authSchema),
    // check the user's token, and then...
    unlock(socket, secureMiddleware)
  )

  socket.on('action', handle({
    [ AUTHENTICATE ]: authenticate
  }))

  next()
}
```
