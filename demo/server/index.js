const http = require('http')
const { mount } = require('paperplane')

const app = require('./rest')
const logger = require('./lib/logger')
const sockets = require('./sockets')

const server = http.createServer(mount({ app, logger }))

if (require.main === module)
  sockets(server).listen(3000, logger)
