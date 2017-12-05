module.exports = (opts={}) => ({
  handle: require('./handle')(opts),
  join:   require('./join'),
  leave:  require('./leave'),
  to:     require('./to')
})
