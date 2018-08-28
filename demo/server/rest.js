require('pug/register')
const { always, compose } = require('ramda')
const { html, methods, routes, send, serve } = require('paperplane')

const frontend = require('./frontend')

const rest = routes({
  '/dist/:path+': serve({ root: 'dist' }),

  '/health': methods({
    GET: always(send())
  }),

  '/*': methods({
    GET: compose(html, frontend)
  })
})

module.exports = rest
