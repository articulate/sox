const moment = require('moment')
const p = require('puddles')

const {
  compose, juxt, map, partial, prepend
} = require('tinyfunk')

const {
  clearTarget,
  onEnter,
  targetVal
} = require('../lib/events')

const addGravity =
  prepend(p('div.gravity'))

const Message = ({ content, sent }) =>
  p('div.message', [
    p('div.sent', moment(sent).format('h:mm A')),
    p('div.content', content)
  ])

const Messages =
  compose(addGravity, map(Message))

const Room = (actions, state) => {
  const {
    messages: { loadMessages, putMessage }
  } = actions

  const {
    messages,
    route: { params: { room } }
  } = state

  return p('div.room', {
    hook: {
      init: partial(loadMessages, [{ room }])
    },
    key: room
  }, [
    p('div.messages', Messages(messages)),

    p('input.input.talkbox', {
      attrs: {
        autofocus: true,
        placeholder: 'say something!'
      },
      on: {
        keypress: onEnter(juxt([
          compose(putMessage, targetVal),
          clearTarget
        ]))
      }
    })
  ])
}

module.exports = Room
