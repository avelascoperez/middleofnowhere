import { promises as fs } from 'fs'
import path from 'path'

async function getBestImagePath(originalPath) {
  const parsed = path.parse(originalPath);
  const webpPath = path.join(parsed.dir, `${parsed.name}.webp`)
  try {
    await fs.access(webpPath)
    return webpPath
  } catch {
    return originalPath
  }
}

async function updateProjectImages(project) {
  if (!project.images) return project
  const updatedImages = []
  for (const img of project.images) {
    updatedImages.push(await getBestImagePath(img))
  }
  return { ...project, images: updatedImages }
}

async function main(inputFile, outputFile) {
  const data = JSON.parse(await fs.readFile(inputFile, 'utf8'))
  const updatedData = await Promise.all(data.map(updateProjectImages))
  await fs.writeFile(outputFile, JSON.stringify(updatedData, null, 2))
}

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('Usage: node update-webp-paths.js <input.json> <output.json>')
  process.exit(1)
}

main(input, output).catch(console.error)
