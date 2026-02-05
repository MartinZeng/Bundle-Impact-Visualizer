import * as fs from 'fs';
import * as path from 'node:path';
import picocolors from 'picocolors';
export function readPackageJson(folderPath) {
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
        packageObj.name = picocolors.red('No name found');
    }
    if (!packageObj.version) {
        packageObj.version = picocolors.red('No version found');
    }
    return packageObj;
}
export function extractDependencies(packageObj) {
    if (!packageObj.dependencies) {
        return {};
    }
    return packageObj.dependencies;
}
