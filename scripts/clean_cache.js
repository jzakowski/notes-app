const fs = require('fs');
const path = require('path');

const cacheDir = path.join(__dirname, '..', '.next', 'cache');

function cleanCache(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      cleanCache(filePath);
      if (fs.readdirSync(filePath).length === 0) {
        fs.rmdirSync(filePath);
      }
    } else {
      fs.unlinkSync(filePath);
    }
  });
}

console.log('Cleaning Next.js cache...');
cleanCache(cacheDir);
console.log('Cache cleaned successfully!');
