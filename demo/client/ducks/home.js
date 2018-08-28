const { assoc, concat, flip } = require('tinyfunk')
const { action, handle } = require('puddles')
const dampen = require('dampen')

const ns = concat('sox-demo/home/')

const SET_ROOM = ns('SET_ROOM')

const init = {
  room: ''
}

exports.reducer = handle(init, {
  [ SET_ROOM ]: flip(assoc('room'))
})

const setRoom =
  dampen(250, action(SET_ROOM))

exports.actions = {
  setRoom
}
