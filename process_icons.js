const sharp = require('sharp');
const fs = require('fs');

async function processIcon(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];
    const a = data[i+3];
    
    // If it's already transparent, skip
    if (a === 0) continue;

    // Threshold: if pixel is very dark, make it transparent
    if (r < 30 && g < 30 && b < 30) {
      data[i+3] = 0;
    } else {
      // Make it solid white
      data[i] = 255;
      data[i+1] = 255;
      data[i+2] = 255;
      data[i+3] = 255; // Fully opaque white
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile(outputPath);
  console.log('Processed', inputPath);
}

async function main() {
  await processIcon('public/assets/DAVINCILOGO.png', 'public/assets/DAVINCILOGO_white.png');
  await processIcon('public/assets/igicon.webp', 'public/assets/igicon_white.png');
}

main().catch(console.error);
