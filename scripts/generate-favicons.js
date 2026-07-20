import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SOURCE_PATH = fs.existsSync(path.resolve('src/assets/images/habesha_tracker_logo_1783619785685.jpg'))
  ? path.resolve('src/assets/images/habesha_tracker_logo_1783619785685.jpg')
  : path.resolve('public/favicon.svg');
const PUBLIC_DIR = path.resolve('public');

async function main() {
  console.log(`🚀 Starting high-fidelity favicon generation from source: ${SOURCE_PATH}...`);
  
  if (!fs.existsSync(SOURCE_PATH)) {
    console.error(`Error: Source file not found at ${SOURCE_PATH}`);
    process.exit(1);
  }

  // 1. Define target sizes and filenames
  const pngTargets = [
    { size: 16, file: 'favicon-16x16.png' },
    { size: 32, file: 'favicon-32x32.png' },
    { size: 150, file: 'mstile-150x150.png' },
    { size: 180, file: 'apple-touch-icon.png' },
    { size: 192, file: 'android-chrome-192x192.png' },
    { size: 512, file: 'android-chrome-512x512.png' }
  ];

  const buffers = {};

  // 2. Render each size to real PNGs
  for (const target of pngTargets) {
    const destPath = path.join(PUBLIC_DIR, target.file);
    console.log(`Rendering ${target.size}x${target.size} to ${target.file}...`);
    
    const buffer = await sharp(SOURCE_PATH)
      .resize(target.size, target.size)
      .png({ compressionLevel: 9 })
      .toBuffer();

    fs.writeFileSync(destPath, buffer);
    buffers[target.size] = buffer;
  }

  // 3. Create a valid multi-resolution favicon.ico containing 16x16 and 32x32 layers
  console.log('Generating valid, multi-resolution favicon.ico...');
  const icoSizes = [16, 32];
  const icoBuffers = icoSizes.map(size => buffers[size]);
  
  // Header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);     // Reserved
  header.writeUInt16LE(1, 2);     // Type (1 = ICO)
  header.writeUInt16LE(icoSizes.length, 4); // Number of images

  const directories = [];
  let currentOffset = 6 + icoSizes.length * 16; // Header (6) + Dir entries (16 * count)

  for (let i = 0; i < icoSizes.length; i++) {
    const size = icoSizes[i];
    const data = icoBuffers[i];
    const dir = Buffer.alloc(16);

    dir.writeUInt8(size >= 256 ? 0 : size, 0); // Width
    dir.writeUInt8(size >= 256 ? 0 : size, 1); // Height
    dir.writeUInt8(0, 2);                      // Color palette (0 = no palette)
    dir.writeUInt8(0, 3);                      // Reserved
    dir.writeUInt16LE(1, 4);                   // Color planes (1)
    dir.writeUInt16LE(32, 6);                  // Bits per pixel (32)
    dir.writeUInt32LE(data.length, 8);         // Image size in bytes
    dir.writeUInt32LE(currentOffset, 12);      // Image offset in file

    directories.push(dir);
    currentOffset += data.length;
  }

  // Combine everything into one single buffer
  const icoBuffer = Buffer.concat([
    header,
    ...directories,
    ...icoBuffers
  ]);

  const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`✅ favicon.ico written successfully with sizes [${icoSizes.join(', ')}]!`);
  console.log('🎉 Favicon rendering generation completed successfully!');
}

main().catch(err => {
  console.error('Fatal error during favicon generation:', err);
  process.exit(1);
});
