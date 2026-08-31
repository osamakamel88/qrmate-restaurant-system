const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'client', 'dist');
const dest = path.join(__dirname, '..', 'dist');

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log('✅ Successfully copied client/dist to root dist/ for Vercel auto-detection!');
} else {
  console.warn('⚠️ Source client/dist does not exist.');
}
