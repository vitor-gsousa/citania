const fs = require('fs');
const path = require('path');

// Lê a versão do arquivo version.js
const versionFile = path.join(__dirname, 'js', 'version.js');
const versionContent = fs.readFileSync(versionFile, 'utf8');
const versionMatch = versionContent.match(/export const VERSION = "([^"]+)"/);
if (!versionMatch) {
  console.error('Versão não encontrada no version.js');
  process.exit(1);
}
const version = versionMatch[1];

// Atualiza package.json
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.version = version;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

// Atualiza manifest.json
const manifestPath = path.join(__dirname, 'manifest.json');
const manifestJson = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifestJson.version = version;
fs.writeFileSync(manifestPath, JSON.stringify(manifestJson, null, 5));

console.log(`Versão atualizada para ${version} em package.json e manifest.json`);