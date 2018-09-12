const { action, handle } = require('puddles')
const { append, concat, constant, flip, juxt } = require('tinyfunk')

const socket = require('../lib/socket')

const ns = concat('sox-demo/messages/')

const CLEAR_MESSAGES = ns('CLEAR_MESSAGES')
const LOAD_MESSAGES  = ns('LOAD_MESSAGES')
const PUT_MESSAGE    = ns('PUT_MESSAGE')

const load = (state, { messages }) =>
  messages

exports.reducer = handle([], {
  [ CLEAR_MESSAGES ]: constant([]),
  [ LOAD_MESSAGES  ]: load,
  [ PUT_MESSAGE    ]: flip(append)
})

const clearMessages = action(CLEAR_MESSAGES)

const loadMessages = juxt([
  clearMessages,
  socket.send(LOAD_MESSAGES)
])

const putMessage = content => (dispatch, getState) => {
  const { route: { params: { room } } } = getState()

  dispatch(
    socket.send(PUT_MESSAGE, { content, room })
  )
}

exports.actions = {
  loadMessages,
  putMessage
}
