const Jimp = require('jimp');
const fs = require('fs');

async function removeBlackBackground(inputPath, outputPath) {
  try {
    const image = await Jimp.read(inputPath);
    const width = image.getWidth();
    const height = image.getHeight();

    // Process each pixel to remove black background
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));
        const brightness = (color.r + color.g + color.b) / 3;
        
        if (brightness < 50) {
          // Make it transparent
          image.setPixelColor(Jimp.rgbaToInt(color.r, color.g, color.b, 0), x, y);
        }
      }
    }

    // Save the processed image as PNG with transparency
    await image.writeAsync(outputPath);

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
  console.log('Then run: node process-logo-jimp.js');
}
