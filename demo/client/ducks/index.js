const { mapObj, prop } = require('tinyfunk')

const ducks = {
  home:     require('./home'),
  messages: require('./messages')
}

exports.actions  = mapObj(prop('actions'), ducks)
exports.reducers = mapObj(prop('reducer'), ducks)
