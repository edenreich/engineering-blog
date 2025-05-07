import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SOURCE_DIR = path.join(process.cwd(), 'public', 'img', 'posts');
const TARGET_DIR = path.join(process.cwd(), 'public', 'img', 'posts', 'thumbnails');
const THUMBNAIL_WIDTH = 266;
const THUMBNAIL_HEIGHT = 192;
const THUMBNAIL_QUALITY = 85;
const EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg'];

/**
 * Ensures the target directory exists
 */
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Gets all image files recursively from the source directory
 */
function getImageFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (path.basename(filePath) !== 'thumbnails') {
        getImageFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  }

  return fileList;
}

/**
 * Creates a thumbnail from an image file
 */
async function createThumbnail(sourcePath: string, targetPath: string): Promise<void> {
  try {
    await sharp(sourcePath)
      .resize({
        width: THUMBNAIL_WIDTH,
        height: THUMBNAIL_HEIGHT,
        fit: 'cover',
        position: 'center',
      })
      .png({ quality: THUMBNAIL_QUALITY })
      .toFile(targetPath);

    console.log(`✅ Created thumbnail: ${path.relative(process.cwd(), targetPath)}`);
  } catch (error) {
    console.error(`❌ Error processing ${sourcePath}:`, error);
  }
}

/**
 * Main function that processes all images
 */
async function generateThumbnails(): Promise<void> {
  ensureDirectoryExists(TARGET_DIR);

  const imageFiles = getImageFiles(SOURCE_DIR);
  console.log(`Found ${imageFiles.length} images to process`);

  const thumbnailPromises = imageFiles.map(async filePath => {
    if (filePath.includes(path.sep + 'thumbnails' + path.sep)) {
      return;
    }

    const relativePath = path.relative(SOURCE_DIR, filePath);
    const targetPath = path.join(
      TARGET_DIR,
      path.dirname(relativePath),
      `${path.basename(filePath, path.extname(filePath))}.png`
    );

    ensureDirectoryExists(path.dirname(targetPath));

    await createThumbnail(filePath, targetPath);
  });

  await Promise.all(thumbnailPromises);
  console.log('✨ Thumbnail generation complete!');
}

generateThumbnails().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
