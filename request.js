'use strict'

const request = require('request')

const endpoint = 'http://finance.yahoo.com/webservice/v1/symbols'
let uri = `${endpoint}/MSFT/quote?format=json`

console.log(`Calling ${uri}`)
request({ uri: uri, json: true }, (err, response, body) => {
  if (err) {
    return console.error(err.message)
  }

  let quote = {
    name: body.list.resources[0].resource.fields.name,
    price: body.list.resources[0].resource.fields.price
  }
  
  console.log(quote)
})
console.log('Done')