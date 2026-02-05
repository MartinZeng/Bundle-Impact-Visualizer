import * as esbuild from 'esbuild';
// check dependency size after install
export async function analyzeModuleSize(code, id) {
    try {
        const result = await esbuild.transform(code, {
            loader: 'ts',
            minify: true,
        });
        return new TextEncoder().encode(result.code).length;
    }
    catch (err) {
        console.error(`[App] failed to analyze ${id}`, err);
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
        };
    }
    catch (err) {
        console.error(`Could not fetch size for ${packageName}`);
        return null;
    }
}
