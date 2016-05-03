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

  // Get symbols from database
  db.get('symbols', (err, symbols) => {
    if (err) {
      res.statusCode = 500
      return res.end(err.message)
    }

    // Query all symbols from API
    for (let i = 0; i < symbols.length; i++) {
      let symbol = symbols[i]
      let uri = `${endpoint}/${symbol}/quote?format=json`

      // Query symbol from API
      request({
        uri: uri,
        json: true
      }, (er1, response, body) => {
        if (er1) {
          res.statusCode = 500
          return res.end(er1.message)
        }

        let quote = {
          name: body.list.resources[0].resource.fields.name,
          price: body.list.resources[0].resource.fields.price
        }

        // Store symbol in database
        db.put(symbol, quote, (er2) => {
          if (er2) {
            res.statusCode = 500
            return res.end(er2.message)
          }

          results.push(quote)
          count++

          // Return results
          if (count === symbols.length) {
            res.end(JSON.stringify(results))
          }
        })
      })
    }
  })
})

server.listen(port, () => console.log(`Listening on port ${port}`))
