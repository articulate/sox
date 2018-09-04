const { compose, map, prepend } = require('tinyfunk')
const p = require('puddles')

const addGravity =
  prepend(p('div.gravity'))

const Message = message =>
  p('div.message', [
    p('div.handle', message.handle),
    p('div.content', message.content)
  ])

const Messages =
  compose(addGravity, map(Message))

const Room = (actions, state) => {
  const { messages } = state

  return p('div.room', [
    p('div.messages', Messages(messages)),

    p('input.input.talkbox', {
      attrs: {
        autofocus: true,
        placeholder: 'say something!'
      }
    })
  ])
}

module.exports = Room
