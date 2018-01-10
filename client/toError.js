const toError = ({ data, message, name, status }) => {
  const err = new Error(message)
  err.data = data
  err.name = name
  err.status = status
  return err
}

module.exports = toError
