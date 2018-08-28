const { compose, propEq, when } = require('tinyfunk')
const p = require('puddles')

const { prevent, targetVal } = require('../lib/events')

const noSpaces =
  when(propEq('keyCode', 32), prevent)

const Home = (actions, state) => {
  const { home: { setRoom } } = actions
  const { home: { room } } = state

  return p('div.home', [
    p('h1.title', 'Welcome, friend!'),
    p('div.instructions', 'Please enter the name of your chat room.'),
    p('div.fieldset', [
      p('input.input.roomname', {
        attrs: {
          autofocus: true,
          placeholder: 'ex: "swedish-pancakes"',
          spellcheck: 'false'
        },
        on: {
          keypress: noSpaces,
          input: compose(setRoom, targetVal)
        },
        props: { value: room }
      }),
      p('a.button.join', {
        attrs: { href: `/${room}` }
      }, 'Join room')
    ])
  ])
}

module.exports = Home
