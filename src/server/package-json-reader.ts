import * as fs from 'fs';
import * as path from 'node:path';

export function readPackageJson(folderPath: string) {
  if (!folderPath) {
    throw new Error('You must pass a folder path');
  }

  const filePath = path.join(folderPath, 'package.json');

  if (!fs.existsSync(filePath)) {
    throw new Error('package.json not found');
  }
  const text = fs.readFileSync(filePath, 'utf8');
  const packageObj = JSON.parse(text);

  if (!packageObj.name) {
    throw new Error('package.json is missing "name"');
  }
  if (!packageObj.version) {
    throw new Error('package.json is missing "version"');
  }

  return packageObj;
}

export function extractDependencies(packageObj: any) {
  if (!packageObj.dependencies) {
    return {};
  }
  return packageObj.dependencies;
}
