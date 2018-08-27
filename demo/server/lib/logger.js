const { compose, dissocPath } = require('ramda')
const { logger } = require('paperplane')

module.exports = compose(logger, dissocPath(['req', 'headers']))
