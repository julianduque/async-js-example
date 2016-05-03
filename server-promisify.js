'use strict'

const http = require('http')
const request = require('request-promise')
const levelup = require('levelup')

const db = require('level-promisify')(levelup('./db', { valueEncoding: 'json' }))
const port = process.env.PORT || 8181
const endpoint = 'http://finance.yahoo.com/webservice/v1/symbols'

// Define symbols (demo purposes only)
db.put('symbols', [ 'MSFT', 'AAPL', 'GOOG', 'LNKD' ])

const server = http.createServer((req, res) => {
  let results = []

  // Get symbols from database
  getSymbols()
    .then((symbols) => {
      let promises = symbols.map(getQuote)
      
      return Promise.all(promises)
    })
    .catch((err) => sendError(res, err))
    .then((quotes) => {
      let promises = quotes.map((elem) => saveQuote(elem.symbol, elem.quote))
      results = quotes.map((elem) => elem.quote)

      return Promise.all(promises)
    })
    .catch((err) => sendError(res, err))
    .then(() => {
      res.end(JSON.stringify(results))
    })
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
