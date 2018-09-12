const { path, propEq, tap, when } = require('tinyfunk')

// clearTarget :: Event -> Event
exports.clearTarget = tap(e =>
  e.target.value = ''
)

// onEnter :: (Event -> a) -> Event -> a
exports.onEnter =
  when(propEq('keyCode', 13))

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
