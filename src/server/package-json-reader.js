// lib/package-json-reader.js
const fs = require('fs');
const path = require('path');

function readPackageJson(folderPath) {
  // folderPath: normalmente será la carpeta del proyecto
  if (!folderPath) {
    throw new Error('You must pass a folder path');
  }

  const filePath = path.join(folderPath, 'package.json');

  // 1) revisar si existe
  if (!fs.existsSync(filePath)) {
    throw new Error('package.json not found');
  }

  // 2) leer el archivo
  const text = fs.readFileSync(filePath, 'utf8');

  // 3) convertir de texto JSON a objeto JS
  const packageObj = JSON.parse(text);

  // 4) validaciones súper básicas
  if (!packageObj.name) {
    throw new Error('package.json is missing "name"');
  }

  if (!packageObj.version) {
    throw new Error('package.json is missing "version"');
  }

  return packageObj;
}

function extractDependencies(packageObj) {
  // si no existe dependencies, devolvemos un objeto vacío
  if (!packageObj.dependencies) {
    return {};
  }

  return packageObj.dependencies;
}

module.exports = {
  readPackageJson,
  extractDependencies,
};
