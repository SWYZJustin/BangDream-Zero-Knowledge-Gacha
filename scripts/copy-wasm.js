const fs = require('fs');
const path = require('path');

const wasmDir = path.join(__dirname, '..', 'src', 'lib', 'wasm');

// Copy zk_gacha files to gacha files (matching the crate name in Cargo.toml)
const filesToCopy = [
  { from: 'zk_gacha_bg.wasm', to: 'gacha_bg.wasm' },
  { from: 'zk_gacha.js', to: 'gacha.js' },
  { from: 'zk_gacha.d.ts', to: 'gacha.d.ts' },
];

filesToCopy.forEach(({ from, to }) => {
  const fromPath = path.join(wasmDir, from);
  const toPath = path.join(wasmDir, to);
  
  if (fs.existsSync(fromPath)) {
    if (from.endsWith('.wasm')) {
      // For binary WASM files, use binary mode
      const content = fs.readFileSync(fromPath);
      fs.writeFileSync(toPath, content);
    } else {
      // For text files (JS, TS), use UTF-8
      let content = fs.readFileSync(fromPath, 'utf8');
      
      // If it's a JS file, replace zk_gacha_bg.wasm with gacha_bg.wasm
      if (from.endsWith('.js')) {
        content = content.replace(/zk_gacha_bg\.wasm/g, 'gacha_bg.wasm');
      }
      
      fs.writeFileSync(toPath, content, 'utf8');
    }
    console.log(`✓ Copied ${from} -> ${to}`);
  } else {
    console.warn(`⚠ Source file not found: ${fromPath}`);
  }
});

console.log('WASM files copied successfully!');

