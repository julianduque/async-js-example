'use strict'

const http = require('http')
const request = require('request')
const levelup = require('levelup')

const db = levelup('./db', { valueEncoding: 'json' })
const port = process.env.PORT || 8181
const endpoint = 'http://finance.yahoo.com/webservice/v1/symbols'

// Define symbols (demo purposes only)
db.put('symbols', [ 'MSFT', 'AAPL', 'GOOG', 'LNKD' ])

const server = http.createServer((req, res) => {
  let results = []
  let count = 0
  let length = 0

  // Get symbols from database
  db.get('symbols', handleSymbols)

  function handleSymbols (err, symbols) {
    if (err) return sendError(res, err)

    length = symbols.length

    // Query all symbols from API
    for (let i = 0; i < length; i++) {
      let symbol = symbols[i]
      getQuote(symbol, (err, quote) => handleQuote(err, symbol, quote))
    }
  }

  function handleQuote (err, symbol, quote) {
    if (err) return sendError(res, err)

    saveQuote(symbol, quote, (err) => onSaveQuote(err, quote))
  }

  function onSaveQuote (err, quote) {
    if (err) return sendError(res, err)

    results.push(quote)
    count++

    // Return results
    if (count === length) {
      res.end(JSON.stringify(results))
    }
  }
})

function getQuote (symbol, callback) {
  let uri = `${endpoint}/${symbol}/quote?format=json`

  // Query symbol from API
  request({
    uri: uri,
    json: true
  }, (err, res, body) => {
    if (err) return callback(err)

    let quote = {
      name: body.list.resources[0].resource.fields.name,
      price: body.list.resources[0].resource.fields.price
    }

    callback(null, quote)
  })
}

function saveQuote (symbol, quote, callback) {
  // Store symbol in database
  db.put(symbol, quote, callback)
}

function sendError (res, err) {
  res.statusCode = 500
  res.end(err.message)
}

server.listen(port, () => console.log(`Listening on port ${port}`))
