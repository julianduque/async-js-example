'use strict'

const fs = require('fs')

console.log('Let me read you a poem: ')
let file = fs.readFileSync('poem.txt', 'utf8')
console.log(file)
console.log('It was beautiful, right?')
