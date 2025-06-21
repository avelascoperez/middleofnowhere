const fs = require('fs')

// Get filenames from command-line arguments
const jsonFile = process.argv[2]
const htmlFile = process.argv[3]

// Helper to check if file exists and is readable
function checkFile(file, desc) {
  try {
    fs.accessSync(file, fs.constants.R_OK)
  } catch (err) {
    console.error(`Error: ${desc} file "${file}" does not exist or is not readable.`)
    process.exit(1)
  }
}

// Check both files
checkFile(jsonFile, 'JSON data')
checkFile(htmlFile, 'HTML template')

try {
  const data = fs.readFileSync(jsonFile, 'utf8')
  let html = fs.readFileSync(htmlFile, 'utf8')
  html = html.replace('/* INJECT_JSON_DATA */', `${data}`)
  fs.writeFileSync(htmlFile, html)
  console.log('Successfully injected data into HTML.')
} catch (err) {
  console.error('Error while processing files:', err.message)
  process.exit(1)
}
