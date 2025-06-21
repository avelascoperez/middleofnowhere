const fs = require('fs')
const data = fs.readFileSync('data.json', 'utf8')
let html = fs.readFileSync('index.html', 'utf8')
html = html.replace( '/* INJECT_JSON_DATA */', `${data}`)
fs.writeFileSync('index.html', html)

