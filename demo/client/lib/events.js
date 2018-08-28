const { path, tap } = require('tinyfunk')

// prevent :: Event -> Event
exports.prevent = tap(e =>
  e.preventDefault()
)

// targetVal :: Event -> String
exports.targetVal =
  path(['target', 'value'])

// trim :: String -> String
exports.trim = string =>
  string.trim()
