const { mapObj, prop } = require('tinyfunk')

const ducks = {
  home: require('./home')
}

exports.actions  = mapObj(prop('actions'), ducks)
exports.reducers = mapObj(prop('reducer'), ducks)
