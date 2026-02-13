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
console.log('\n')
       console.log(picocolors.gray('== ') +
      //  picocolors.bold(picocolors.cyan('📦 B I V')) + 
      // console.log(picocolors.white('') +
       picocolors.bold(picocolors.cyan('📦Bundle Impact Visualizer')) + 
      //  picocolors.white(''));
      picocolors.gray(' =='));
      // console.log(picocolors.gray('--------------------------------'))
      // console.log('\n') 
      console.log(
  picocolors.cyan('\n✅ Local ') + 
  picocolors.yellow('{}') + 
  picocolors.italic(picocolors.cyan('package.json')) + 
  picocolors.cyan(' loaded!')
);
      console.log(`${picocolors.gray('================================')}\n`);
      console.log(`${picocolors.magenta('Name:')}    ${pkg.name}`);
      console.log(`${picocolors.gray('--------------------------------')}\n`);
      console.log(`${picocolors.magenta('Version:')} ${pkg.version}`);
      console.log(`${picocolors.gray('--------------------------------')}\n`);
      console.log(`${picocolors.magenta('Packages:')} ${Object.keys(deps).length}`);
      console.log(`${picocolors.gray('--------------------------------')}\n`)
    } catch (err: any) {
      console.log(picocolors.red(`Local mode error: ${err.message}`));
      process.exit(1);
    }
    return;
  }
   console.log(`\n🔎 ${picocolors.cyan(picocolors.bold('Searching for'))}...`);
console.log(`${picocolors.gray('===================')}`);
  
   
const stats = await getRemotePackageSize(packageName);

  if (stats) {
    if (!stats.isBundleable) {
      console.log(
        picocolors.bgRed(picocolors.white(' WARNING ')),
        picocolors.red(
          'This package is likely not bundleable (e.g., Node-only or CLI tool.)',
        ),
      );
    }
    console.log(`\n${picocolors.bold(picocolors.magenta(stats.name.charAt(0).toUpperCase() + stats.name.slice(1)))}`);

    console.log(`${picocolors.gray('-------------------')}`);
   
    console.log(
      `Minified: ${picocolors.yellow((stats.size / 1024).toFixed(2) + 'KB\⬆')}`,
    );
    console.log(`${picocolors.gray('-------------------')}`);
    console.log(
      `Gzipped:  ${picocolors.green((stats.gzip / 1024).toFixed(2) +   'KB\⬇')}`,
    );
    console.log(`${picocolors.gray('+++++++++++++++++++')}\n`);
  } else {
    console.log(picocolors.red(`could not find package: ${packageName}`));
  }
}

run();
