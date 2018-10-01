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
| [`to`](#to) | `(Action -> String) -> Action -> Action` |

**Note:** The type `Action` above refers to an [FSA-compliant](https://github.com/redux-utilities/flux-standard-action) action of the shape `{ type, payload, meta }`.

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

See also [`mount`](#mount).

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
const { evolveP } = require('@articulate/funky')
const { handle, join } = require('@articulate/sox')
const { pipeP } = require('ramda')

const courses = require('../db/courses')
const { GET_COURSE } = require('../actions/courses')

const courseRoom = axn =>
  `courses/${axn.payload.id}`

const getCourse = pipeP(
  evolveP({ payload: courses.getCourse }),
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
const { evolveP } = require('@articulate/funky')
const { handle, leave } = require('@articulate/sox')
const { pipeP } = require('ramda')

const courses = require('../db/courses')
const { DEL_COURSE } = require('../actions/courses')

const courseRoom = axn =>
  `courses/${axn.payload.id}`

const delCourse = pipeP(
  evolveP({ payload: courses.delCourse }),
  leave(courseRoom)
)

const app = handle({
  [ DEL_COURSE ]: delCourse
})
```

### to

```haskell
to :: (Action -> String) -> Action -> Action
```

Accepts a room function and an action.  The room function is used to translate the action into a room identifier.  An `'action'` event with the action is then [broadcast to all sockets in that room](http://devdocs.io/socketio/rooms-and-namespaces#rooms) (with the exception of the [`action.meta.socket`](#mount)).  Finally, the action is passed through.

**Note:** To broadcast to all sockets in a room from code outside the `sox` request/reponse cycle, set the `action.meta.socket` to a [`socket.io-emitter`](https://yarnpkg.com/en/package/socket.io-emitter).

See also [`join`](#join), [`leave`](#leave), [`mount`](#mount).

```js
const { evolveP } = require('@articulate/funky')
const { handle, to } = require('@articulate/sox')
const { pipeP } = require('ramda')

const { courses } = require('../db/courses')
const { PUT_COURSE } = require('../action/courses')

const courseRoom = axn =>
  `courses/${axn.payload.id}`

const putCourse = pipeP(
  evolveP({ payload: courses.putCourse }),
  to(courseRoom)
)

const app = handle({
  [ PUT_COURSE ]: putCourse
})
```
