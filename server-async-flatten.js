'use strict'

const http = require('http')
const request = require('request')
const levelup = require('levelup')
const async = require('async')

const db = levelup('./db', { valueEncoding: 'json' })
const port = process.env.PORT || 8181
const endpoint = 'http://finance.yahoo.com/webservice/v1/symbols'

// Define symbols (demo purposes only)
db.put('symbols', [ 'MSFT', 'AAPL', 'GOOG', 'LNKD' ])

const server = http.createServer((req, res) => {
  // Get symbols from database
  db.get('symbols', handleSymbols)

  function handleSymbols (err, symbols) {
    if (err) return sendError(res, err)

    // Query all symbols from API
    async.map(symbols, processSymbol, processQuotes)
  }

  function processSymbol (symbol, next) {
    getQuote(symbol, (err, quote) => next(err, { symbol, quote }))
  }

  function processQuotes (err, quotes) {
    if (err) return sendError(res, err)

    // Save quotes
    async.each(quotes, saveQuote, (err) => sendResults(err, quotes))
  }

  function sendResults (err, quotes) {
    if (err) return sendError(res, err)

    let results = quotes.map((elem) => elem.quote)
    res.end(JSON.stringify(results))
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

function saveQuote (elem, callback) {
  // Store symbol in database
  db.put(elem.symbol, elem.quote, callback)
}

function sendError (res, err) {
  res.statusCode = 500
  res.end(err.message)
}

server.listen(port, () => console.log(`Listening on port ${port}`))
