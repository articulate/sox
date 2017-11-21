const toError = ({ message, name, status }) => {
  const err = new Error(message)
  err.name = name
  err.status = status
  return err
}

module.exports = toError
