// check dependency size after install
async function getNpmFallbackSize(packageName) {
    try {
        const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`);
        const data = await response.json();
        return {
            name: data.name,
            size: data.dist?.unpackedSize || 0,
            gzip: 0,
            description: data.description,
            isBundleable: false,
            version: data.version,
        };
    }
    catch (err) {
        return null;
    }
}
// check dependecy size before install
export async function getRemotePackageSize(packageName) {
    try {
        const response = await fetch(`https://bundlephobia.com/api/size?package=${packageName}`);
        if (response.status === 404) {
            throw new Error(`Package ${packageName} not found on npm`);
        }
        if (response.status === 500) {
            throw new Error(`Bundlephobia couldn't bundle ${packageName}. It might be a Node-only tool`);
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
            isBundleable: !!data.treeShakeable,
            version: data.version,
        };
    }
    catch (err) {
        return await getNpmFallbackSize(packageName);
    }
}
