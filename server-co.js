'use strict'

const http = require('http')
const request = require('request-promise')
const levelup = require('levelup')
const co = require('co')

const db = require('level-promisify')(levelup('./db', { valueEncoding: 'json' }))
const port = process.env.PORT || 8181
const endpoint = 'http://finance.yahoo.com/webservice/v1/symbols'

// Define symbols (demo purposes only)
db.put('symbols', [ 'MSFT', 'AAPL', 'GOOG', 'LNKD' ])

const server = http.createServer((req, res) => {
  co(function * () {
    // Get symbols
    let symbols = yield getSymbols()

    // Create fetch symbols promise array
    let fetchQuotes = symbols.map(getQuote)

    // Fetch all quotes
    let quotes = yield Promise.all(fetchQuotes)

    // Create save quotes promise array
    let saveQuotes = quotes.map((elem) => saveQuote(elem.symbol, elem.quote))

    // Save all quotes
    yield Promise.all(saveQuotes)

    let results = quotes.map((elem) => elem.quote)

    res.end(JSON.stringify(results))
  }).catch((err) => sendError(res, err))
})

function getQuote (symbol) {
  let uri = `${endpoint}/${symbol}/quote?format=json`

  return request({
    uri: uri,
    json: true
  }).then((body) => {
    let quote = {
      name: body.list.resources[0].resource.fields.name,
      price: body.list.resources[0].resource.fields.price
    }

    return Promise.resolve({ symbol, quote })
  }).catch((err) => Promise.reject(err))
}

function saveQuote (symbol, quote) {
  return db.put(symbol, quote)
}

function getSymbols () {
  return db.get('symbols')
}

function sendError (res, err) {
  res.statusCode = 500
  res.end(err.message)
}

server.listen(port, () => console.log(`Listening on port ${port}`))
