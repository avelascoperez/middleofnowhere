import fs from 'fs'
import path from 'path'

// check if file exists and is readable
function checkFile(file, desc) {
  try {
    fs.accessSync(file, fs.constants.R_OK)
  } catch (err) {
    console.error(`Error: ${desc} file "${file}" does not exist or is not readable.`)
    process.exit(1)
  }
}

function isImageFile(filename) {
  return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(filename)
}

// Get the best image path: if .webp exists, use it; otherwise, use the original
function getBestImagePath(originalPath) {
  const parsed = path.parse(originalPath)
  const webpPath = path.join(parsed.dir, `${parsed.name}.webp`)
  // Note: We check if the file exists in the filesystem, not just if the extension is .webp
  try {
    fs.accessSync(webpPath, fs.constants.R_OK)
    return webpPath
  } catch {
    return originalPath
  }
}

(() => {
  // Get filenames from command-line arguments
  const jsonFile = process.argv[2]
  const htmlFile = process.argv[3]
  const assetsDir = 'assets'

  // Check both files
  checkFile(jsonFile, 'JSON data')
  checkFile(htmlFile, 'HTML template')

  try {
    // Read and parse JSON data
    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'))

    // For each project, try to read assets
    for (const project of data) {
      const projectAssetsDir = path.join(assetsDir, project.id)
      let description = ''
      let images = []
      if (fs.existsSync(projectAssetsDir) && fs.statSync(projectAssetsDir).isDirectory()) {
        // Read all files in the directory
        const files = fs.readdirSync(projectAssetsDir)
        // Find and read description.md
        const descFile = files.find(f => f.toLowerCase() === 'description.md')
        if (descFile) {
          description = fs.readFileSync(path.join(projectAssetsDir, descFile), 'utf8')
        }
        // Collect image files, sorted by filename
        images = files
          .filter(f => isImageFile(f) && f.toLowerCase() !== 'description.md')
          .sort()
          .map(f => path.join('dist', 'static', assetsDir, project.id, f))
          // Use the .webp version if it exists
          .map(imgPath => {
            let pth;
            // We need to check if the .webp version exists in the filesystem
            // Since your build puts images in 'static/assets', we check there
            const parsed = path.parse(imgPath)
            const webpPath = path.join(parsed.dir, `${parsed.name}.webp`)
            try {
              fs.accessSync(webpPath, fs.constants.R_OK)
              pth = webpPath
            } catch {
              pth = imgPath
            }
            // remove "dist"
            return pth.split('/').slice(1).join('/')
          })
      }
      project.description = description
      project.images = images
    }

    // Read HTML and inject the new JSON data
    let html = fs.readFileSync(htmlFile, 'utf8')
    html = html.replace('/* INJECT_JSON_DATA */', JSON.stringify(data, null, 2))
    fs.writeFileSync(htmlFile, html)
    console.log('Successfully injected data (with images and markdown) into HTML.')
  } catch (err) {
    console.error('Error while processing files:', err.message)
    process.exit(1)
  }
})()
