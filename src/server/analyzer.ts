import * as esbuild from 'esbuild';
import { parseNpmResponse } from './package-data-parser.js';

// check dependency size after install
async function getNpmFallbackSize(packageName: string) {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${packageName}/latest`,
    );

    const data = await response.json();
    return {
      name: data.name,
      size: data.dist?.unpackedSize || 0,
      gzip: 0,
      description: data.description,
      isBundleable: false,
      version: data.version,
    };
  } catch (err) {
    return null;
  }
}

function checkIsBundleable(data: any): boolean {
  const name = data.name.toLowerCase();

  const nodeOnlyTerms = [
    'cli',
    'compiler',
    'parser',
    'server',
    'eslint',
    'prettier',
    'typescript',
  ];

  if (nodeOnlyTerms.some((term) => name.includes(term))) {
    return false;
  }

  if (data.treeShakeable) return true;

  if (data.assets && data.assets.length > 0) return true;

  if (data.haseModule || data.hasSideEffects === false) return true;

  return false;
}

export async function getPackageManifest(packageName: string) {
  const response = await fetch(
    `https://registry.npmjs.org/${packageName}/latest`,
  );
  if (!response.ok) return null;

  const rawData = await response.json();
  return parseNpmResponse(rawData);
}

// check dependecy size before install
export async function getRemotePackageSize(packageName: string) {
  try {
    const response = await fetch(
      `https://bundlephobia.com/api/size?package=${packageName}`,
    );

    if (response.status === 404) {
      throw new Error(`Package ${packageName} not found on npm`);
    }
    if (response.status === 500) {
      throw new Error(
        `Bundlephobia couldn't bundle ${packageName}. It might be a Node-only tool`,
      );
    }
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();

    return {
      name: data.name,
      size: data.size,
      gzip: data.gzip,
      description: data.description,
      // check if package is bundleable
      isBundleable: checkIsBundleable(data),
      version: data.version,
    };
  } catch (err) {
    return await getNpmFallbackSize(packageName);
  }
}
