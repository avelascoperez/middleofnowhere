import { globby } from 'globby';
import path from 'path';
import fs from 'fs';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminWebp from 'imagemin-webp';
import sharp from 'sharp';

const MAX_DIMENSION = 8192; // Lower than 16383 for safety

function ensureDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function processImage(file, destDir) {
  try {
    const metadata = await sharp(file).metadata();
    let needsResize = metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION;
    let tempFile = null;

    if (needsResize) {
      tempFile = path.join('/tmp', path.basename(file));
      await sharp(file)
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(tempFile);
      file = tempFile;
    }

    // Try to minify with all plugins except WebP
    let plugins = [
      imageminMozjpeg(),
      imageminPngquant({ quality: [0.6, 0.8] }),
      imageminGifsicle()
    ];

    // Only add WebP if the image is not too large (to avoid PARTITION0_OVERFLOW)
    if (metadata.width <= MAX_DIMENSION && metadata.height <= MAX_DIMENSION) {
      plugins.push(imageminWebp());
    }

    await imagemin([file], {
      destination: destDir,
      plugins
    });

    if (tempFile) {
      fs.unlinkSync(tempFile);
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}

(async () => {
  const src = 'assets/**/*.{jpg,jpeg,png,webp,gif}';
  const dest = 'dist/static/assets';
  ensureDir(dest);
  const files = await globby(src);
  for (const file of files) {
    const relativePath = path.relative('assets', file);
    const destPath = path.join(dest, path.dirname(relativePath));
    ensureDir(destPath);
    await processImage(file, destPath);
  }
})();

