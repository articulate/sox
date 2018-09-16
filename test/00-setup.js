console.info = require('@articulate/spy')()

afterEach(() =>
  console.info.reset()
)
