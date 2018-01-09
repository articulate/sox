const toError = ({ message, name, status, data }) => {
  const err = new Error(message)
  err.name = name
  err.status = status
  err.data = data
  return err
}

module.exports = toError
