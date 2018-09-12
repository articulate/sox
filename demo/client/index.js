const functor = require('redux-functor')
const future = require('redux-future2')
const { mount } = require('puddles')

const { actions, reducers } = require('./ducks')
const socket = require('./lib/socket')

const middleware = [ future, functor ]

const root = document.getElementById('root')

const routes = {
  '/':      require('./views/home'),
  '/:room': require('./views/room')
}

const { dispatch } = mount({ actions, middleware, reducers, root, routes })

socket.on('action', dispatch)
