const { mount } = require('puddles')

const { actions, reducers } = require('./ducks')

const root = document.getElementById('root')

const routes = {
  '/':      require('./views/home'),
  '/:room': require('./views/room')
}

mount({ actions, reducers, root, routes })
