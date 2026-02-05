#!/usr/bin/env node
import { getRemotePackageSize } from './analyzer.js';
import picocolors from 'picocolors';
async function run() {
    //argv[0] is node
    //argv[1] is the script path
    const packageName = process.argv[2];
    if (!packageName) {
        console.log(picocolors.yellow('please prvoide a valid package name.'));
        process.exit(1);
    }
    // Local mode: test our package.json reader
    // Inside src/server/cli.ts
    if (packageName === '--local') {
        try {
            const reader = await import('./package-json-reader.js');
            const pkg = reader.readPackageJson(process.cwd());
            const deps = reader.extractDependencies(pkg);
            console.log(picocolors.green('\n✅ Local package.json loaded!'));
            console.log(`${picocolors.bold('Name:')}    ${pkg.name}`);
            console.log(`${picocolors.bold('Version:')} ${pkg.version}`);
            console.log(`${picocolors.bold('Deps:')}    ${Object.keys(deps).length}\n`);
        }
        catch (err) {
            console.log(picocolors.red(`Local mode error: ${err.message}`));
            process.exit(1);
        }
        return;
    }
    console.log(picocolors.cyan(`searching for ${packageName}`));
    const stats = await getRemotePackageSize(packageName);
    if (stats) {
        console.log(`\n${picocolors.bold(picocolors.green(stats.name))}`);
        console.log(`${picocolors.gray('---------------------')}`);
        console.log(`Minified: ${picocolors.yellow((stats.size / 1024).toFixed(2) + 'KB')}`);
        console.log(`Gzipped: ${picocolors.green((stats.gzip / 1024).toFixed(2) + 'KB')}`);
        console.log(`${picocolors.gray('---------------------')}\n`);
    }
    else {
        console.log(picocolors.red(`could not find package: ${packageName}`));
    }
}
run();
