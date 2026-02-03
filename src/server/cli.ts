#!/usr/bin/env npx tsx
import { getRemotePackageSize } from './analyzer';
import picocolors from 'picocolors';

async function run() {
  //argv[0] is node
  //argv[1] is the script path

  const packageName = process.argv[2];

  if (!packageName) {
    console.log(picocolors.yellow('please prvoide a valid package name.'));
    process.exit(1);
  }

  console.log(picocolors.cyan(`searching for ${packageName}`));

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
