'use strict'

const fs = require('fs')

console.log('Let me read you a poem: ')
fs.readFile('poem.txt', 'utf8', (err, file) => {
  if (err) return console.error(err)
  
  console.log(file)  
})
console.log('It was beautiful, right?')
