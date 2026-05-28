const sharp = require('sharp');
const fs = require('fs');

async function removeBlackBackground(inputPath, outputPath) {
  try {
    // Read the original image
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Get the image data
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Process each pixel to remove black background
    const processedData = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = info.channels === 4 ? data[i + 3] : 255;

      // Check if pixel is black or very dark (background)
      const brightness = (r + g + b) / 3;
      if (brightness < 30) {
        // Make it transparent
        processedData[i] = r;
        processedData[i + 1] = g;
        processedData[i + 2] = b;
        processedData[i + 3] = 0; // Alpha = 0 (transparent)
      } else {
        // Keep original pixel
        processedData[i] = r;
        processedData[i + 1] = g;
        processedData[i + 2] = b;
        processedData[i + 3] = a;
      }
    }

    // Save the processed image as PNG with transparency
    await sharp(processedData, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
      .png()
      .toFile(outputPath);

    console.log('Logo processed successfully! Black background removed.');
    console.log(`Output saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error processing logo:', error);
  }
}

// Check if input file exists
const inputPath = './public/images/logo-input.png';
const outputPath = './public/images/logo.png';

if (fs.existsSync(inputPath)) {
  removeBlackBackground(inputPath, outputPath);
} else {
  console.log('Please save the logo image as: ./public/images/logo-input.png');
  console.log('Then run: node process-logo.js');
}
