const { Jimp } = require('jimp');
const path = require('path');

const inputPath = "C:\\Users\\WINDOWS\\.gemini\\antigravity-ide\\brain\\ce44e621-7eba-4ae7-a853-80d655a06228\\media__1783693102880.jpg";
const outputPath = path.join(__dirname, '..', 'public', 'robot.png');

console.log("Reading image from:", inputPath);
Jimp.read(inputPath)
  .then(image => {
    console.log("Processing pixels...");
    // Scan all pixels
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // Check if pixel is white or very close to white (allow slight color variations for anti-aliasing edges)
      // Pure white is 255, 255, 255. We can target pixels where R, G, B are all > 245
      if (r > 248 && g > 248 && b > 248) {
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
      }
    });

    console.log("Saving transparent image to:", outputPath);
    return image.write(outputPath);
  })
  .then(() => {
    console.log("Success! Transparent robot image saved to public/robot.png");
  })
  .catch(err => {
    console.error("Error processing image:", err);
  });
