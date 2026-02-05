#!/usr/bin/env npx tsx
import picocolors from 'picocolors';
//import pkgReader from './packageJsonReader';

async function run() {
  const packageName = process.argv[2];

  if (!packageName) {
    console.log(picocolors.yellow('please provide a valid package name.'));
    process.exit(1);
  }

  // Local mode: test our package.json reader
  if (packageName === '--local') {
  try {
    const mod: any = await import('./package-json-reader.js');


    //const readerObj = mod['module.exports'] || mod.default || mod;
    //console.log('readerObj keys:', Object.keys(readerObj));


    //const readPkg = readerObj.readPackageJson;
    //const getDeps = readerObj.extractDependencies;
    const readerObj = mod.default || mod;
    const readPkg = readerObj.readPackageJson;
    const getDeps = readerObj.extractDependencies;

    if (!readPkg || !getDeps) {
      throw new Error('No se encontraron las funciones del packageJsonReader');
    }

    const pkg = readPkg('./src/server');
    const deps = getDeps(pkg);

    console.log(picocolors.green('Local package.json loaded!'));
    console.log(`Name: ${pkg.name}`);
    console.log(`Version: ${pkg.version}`);
    console.log(`Dependencies: ${Object.keys(deps).length}`);
  } catch (err: any) {
    console.log(picocolors.red(`Local mode error: ${err.message}`));
    process.exit(1);
  }
  return;
}



  // Remote mode: only load analyzer when needed
  console.log(picocolors.cyan(`searching for ${packageName}`));

  const { getRemotePackageSize } = await import('./analyzer');
  const stats = await getRemotePackageSize(packageName);

  if (stats) {
    console.log(`\n${picocolors.bold(picocolors.green(stats.name))}`);
    console.log(`${picocolors.gray('---------------------')}`);
    console.log(
      `Minified: ${picocolors.yellow((stats.size / 1024).toFixed(2) + 'KB')}`,
    );
    console.log(
      `Gzipped: ${picocolors.green((stats.gzip / 1024).toFixed(2) + 'KB')}`,
    );
    console.log(`${picocolors.gray('---------------------')}\n`);
  } else {
    console.log(picocolors.red(`could not find package: ${packageName}`));
  }
}

run();
