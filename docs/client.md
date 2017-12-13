# Client API

```haskell
sox : { k: v } -> Socket
```

Instantiates a [socket.io](https://socket.io/) client configured by the following options:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `uri` | `String` | `''` | the socket.io service URI |

Returns a [socket.io](https://socket.io/) client instance with a few new helpful methods added.

```js
const socket = require('@articulate/sox')({ uri: window.env.SERVICE_URI })
```

The instance will also have a `socket.session` property, a unique id that persists through socket reconnects.  Useful for managing resource locks between different browser sessions or tabs.

```js
socket.session //=> ex: 'cjb5fg7bw00003h67ghy84kzx'
```

## New methods

| Method | Signature |
| ------ | --------- |
| [`debounce`](#debounce) | `Number -> String -> a -> IO Async Action` |
| [`send`](#send) | `String -> a -> Async Action` |
| [`throttle`](#throttle) | `Number -> String -> a -> IO Async Action` |

### debounce

```haskell
debounce :: Number -> String -> a -> IO Async Action
```

Similar to [`send`](#send), but first accepts a `wait` in ms.  Debounces the sending of actions over the socket, and only resolves once after the debounce completes.  Useful for debouncing user input.

Returns an [`IO`](https://github.com/evilsoft/crocks#crocks) that resolves with an [`Async`](https://github.com/evilsoft/crocks#crocks), so you will need both [`redux-io`](https://www.npmjs.com/package/redux-io) and [`redux-future`](https://www.npmjs.com/package/redux-future).

**Note:** If you also need to redraw after each keystroke (very common use case), then you should [`juxt`](http://devdocs.io/ramda/index#juxt) to create a pair of actions: one synchronous to render the new state, and one debounced to send the action over the socket.  If you do, don't forget to use [`redux-functor`](https://www.npmjs.com/package/redux-functor), since you are dispatching an array of actions.

See also [`send`](#send), [`throttle`](#throttle).

```js
const { action } = require('@articulate/ducks')
const juxt = require('ramda/src/juxt')

const socket = require('../lib/socket')

exports.putTitle = juxt([
  action('PUT_TITLE'),
  socket.debounce(500, 'PUT_TITLE')
])
```

### send

```haskell
send :: String -> a -> Async Action
```

An action-creator that accepts a `type` and `payload`, and then sends an [FSA-compliant](https://github.com/acdlite/flux-standard-action) action over the socket.  Resolves with a response action, and inflates the payload of error-type actions into a real `Error`.

Returns an [`Async`](https://github.com/evilsoft/crocks#crocks), so you'll need appropriate middleware, such as [`redux-future`](https://www.npmjs.com/package/redux-future).

See also [`debounce`](#debounce), [`throttle`](#throttle).

```js
const always = require('ramda/src/always')

const socket = require('../lib/sox')

exports.getSelf = always(socket.send('GET_SELF', null))
exports.getUser = socket.send('GET_USER')
```

### throttle

```haskell
throttle :: Number -> String -> a -> IO Async Action
```

Similar to [`send`](#send), but first accepts a `wait` in ms.  Throttles the sending of actions over the socket, and only resolves at most once every `wait` ms.  Useful for throttling user input for real-time collaboration.

Returns an [`IO`](https://github.com/evilsoft/crocks#crocks) that resolves with an [`Async`](https://github.com/evilsoft/crocks#crocks), so you will need both [`redux-io`](https://www.npmjs.com/package/redux-io) and [`redux-future`](https://www.npmjs.com/package/redux-future).

**Note:** If you also need to redraw after each keystroke (very common use case), then you should [`juxt`](http://devdocs.io/ramda/index#juxt) to create a pair of actions: one synchronous to render the new state, and one throttled to send the action over the socket.  If you do, don't forget to use [`redux-functor`](https://www.npmjs.com/package/redux-functor), since you are dispatching an array of actions.

See also [`debounce`](#debounce), [`send`](#send).

```js
const { action } = require('@articulate/ducks')
const juxt = require('ramda/src/juxt')

const socket = require('../lib/socket')

exports.putTitle = juxt([
  action('PUT_TITLE'),
  socket.throttle(500, 'PUT_TITLE')
])
```
