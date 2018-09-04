const { action, handle } = require('puddles')
const { concat } = require('tinyfunk')

const ns = concat('sox-demo/messages/')

const init = [{
  id: '1536033919153-01',
  handle: 'Joey Fella',
  content: 'Wassup bro!'
}, {
  id: '1536033956272-01',
  handle: 'Señor Frog',
  content: 'It ain\'t easy being green.'
}, {
  id: '1536033919153-01',
  handle: 'Joey Fella',
  content: 'Wassup bro!'
}, {
  id: '1536033956272-01',
  handle: 'Señor Frog',
  content: 'It ain\'t easy being green.'
}, {
  id: '1536033919153-01',
  handle: 'Joey Fella',
  content: 'Wassup bro!'
}, {
  id: '1536033956272-01',
  handle: 'Señor Frog',
  content: 'It ain\'t easy being green.'
}, {
  id: '1536033919153-01',
  handle: 'Joey Fella',
  content: 'Wassup bro!'
}, {
  id: '1536033956272-01',
  handle: 'Señor Frog',
  content: 'It ain\'t easy being green.'
}, {
  id: '1536033919153-01',
  handle: 'Joey Fella',
  content: 'Wassup bro!'
}, {
  id: '1536033956272-01',
  handle: 'Señor Frog',
  content: 'It ain\'t easy being green.'
}]

exports.reducer = handle(init, {})
