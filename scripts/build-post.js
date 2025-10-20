import fs from 'fs';
import path from 'path';

const distPath = path.resolve('dist');
const manifestPath = path.join(distPath, 'manifest.json');

// Read manifest
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Update paths for built files
  manifest.background.service_worker = 'background/index.js';
  manifest.content_scripts[0].js = ['content/index.js'];

  // Write back
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Manifest updated for production');
} else {
  console.error('Manifest not found in dist folder');
}