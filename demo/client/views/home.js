const { compose, partial, propEq, when } = require('tinyfunk')
const p = require('puddles')

const { prevent, targetVal } = require('../lib/events')

const noSpaces =
  when(propEq('keyCode', 32), prevent)

const Home = (actions, state) => {
  const { home: { setRoom }, route: { go } } = actions
  const { home: { room } } = state

  const href = `/${room}`

  return p('div.home', [
    p('h1.title', 'Welcome, friend!'),
    p('div.instructions', 'Please enter the name of your chat room.'),
    p('form.fieldset', {
      on: { submit: compose(partial(go, [ href ]), prevent) }
    }, [
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
      p('a.button.join', { attrs: { href } }, 'Join room')
    ])
  ])
}

module.exports = Home
