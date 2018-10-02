const { concat, path, pipeP } = require('ramda')
const { assocWithP, validate } = require('@articulate/funky')
const Joi = require('joi')
const { join, overPayload, to } = require('@articulate/sox')

const messages = require('../db/messages')

const ns = concat('sox-demo/messages/')

const PUT_MESSAGE   = ns('PUT_MESSAGE')
const LOAD_MESSAGES = ns('LOAD_MESSAGES')

const loadSchema = Joi.object({
  room: Joi.string().required()
}).required()

const putSchema = Joi.object({
  content: Joi.string().required(),
  room:    Joi.string().required()
}).required()

const loadMessages =
  pipeP(
    overPayload(
      pipeP(
        validate(loadSchema),
        assocWithP('messages', messages.load)
      )
    ),
    join(path(['payload', 'room']))
  )

const putMessage =
  pipeP(
    overPayload(
      pipeP(
        validate(putSchema),
        messages.put
      )
    ),
    to(path(['payload', 'room']))
  )

module.exports = {
  [ LOAD_MESSAGES ]: loadMessages,
  [ PUT_MESSAGE   ]: putMessage
}
