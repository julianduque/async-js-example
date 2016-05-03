'use strict'

import { send } from 'micro-core'
import request from 'request-promise'
import levelup from 'levelup'

const db = require('level-promisify')(levelup('./db', { valueEncoding: 'json' }))
const port = process.env.PORT || 8181
const endpoint = 'http://finance.yahoo.com/webservice/v1/symbols'

// Define symbols (demo purposes only)
db.put('symbols', [ 'MSFT', 'AAPL', 'GOOG', 'LNKD' ])

export default async function (req, res) {
  try {
    // Get symbols
    let symbols = await getSymbols()

    // Create fetch symbols promise array
    let fetchQuotes = symbols.map(getQuote)

    // Fetch all quotes
    let quotes = await Promise.all(fetchQuotes)

    // Create save quotes promise array
    let saveQuotes = quotes.map((elem) => saveQuote(elem.symbol, elem.quote))

    // Save all quotes
    await Promise.all(saveQuotes)

    let results = quotes.map(elem => elem.quote)

    send(res, 200, results)
  } catch (err) {
    send(res, 500, err.message)
  }
}

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
