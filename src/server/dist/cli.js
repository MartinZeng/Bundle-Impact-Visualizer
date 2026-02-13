// #!/usr/bin/env node
// import { getRemotePackageSize } from './analyzer.js';
// import picocolors from 'picocolors';


// async function run() {
//     //argv[0] is node
//     //argv[1] is the script path
//     const packageName = process.argv[2];
//     if (!packageName) {
//         console.log(picocolors.yellow('please prvoide a valid package name.'));
//         process.exit(1);
//     }
//     // Local mode: test our package.json reader
//     // Inside src/server/cli.ts
//     if (packageName === '--local') {
//         try {
//             const reader = await import('./package-json-reader.js');
//             const pkg = reader.readPackageJson(process.cwd());
//             const deps = reader.extractDependencies(pkg);
//             console.log(picocolors.green('\n✅ Local package.json loaded!'));
//             console.log(picocolors.yellow('Name:')    `${pkg.name}`);
//             console.log(`${picocolors.bold('Version:')} ${pkg.version}`);
//             console.log(`${picocolors.bold('Deps:')}    ${Object.keys(deps).length}\n`);
//         }
//         catch (err) {
//             console.log(picocolors.red(`Local mode error: ${err.message}`));
//             process.exit(1);
//         }
//         return;
//     }


// console.log(`${picocolors.green('🔎 Searching for...')} ${packageName}`);

// console.log(picocolors.cyan("Searching without emoji"));
//     const stats = await getRemotePackageSize(packageName);
//     if (stats) {
//         console.log(`\n${picocolors.bold(picocolors.blue(stats.name))}`);
//         console.log(`${picocolors.gray('---------------------')}`);
//         console.log(`Minified: ${picocolors.yellow((stats.size / 1024).toFixed(2) + 'KB')}`);
//         console.log(`Gzipped: ${picocolors.green((stats.gzip / 1024).toFixed(2) + 'KB')}`);
//         console.log(`${picocolors.gray('---------------------')}\n`);
//     }
//     else {
//         console.log(picocolors.red(`could not find package: ${packageName}`));
//     }
// }
// run();



// #!/usr/bin/env node
// import { getRemotePackageSize } from './analyzer.js';
// import picocolors from 'picocolors';
// console.log('isTTY:', process.stdout.isTTY);
// import { createColors } from 'picocolors';
// const picocolors = createColors(true);
process.env.FORCE_COLOR = '1';

import { getRemotePackageSize } from './analyzer.js';
<<<<<<< HEAD
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
            console.log(`${picocolors.bold('Name:')}     ${pkg.name}`);
            console.log(`${picocolors.bold('Version:')}  ${pkg.version}`);
            console.log(`${picocolors.bold('Packages:')} ${Object.keys(deps).length}\n`);
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
        if (!stats.isBundleable) {
            console.log(picocolors.bgRed(picocolors.white(' WARNING ')), picocolors.red('This package is likely not bundleable (e.g., Node-only or CLI tool.)'));
        }
        console.log(`\n${picocolors.bold(picocolors.green(stats.name))}`);
        console.log(`${picocolors.gray('---------------------')}`);
        console.log(`Minified: ${picocolors.yellow((stats.size / 1024).toFixed(2) + 'KB')}`);
        console.log(`Gzipped: ${picocolors.green((stats.gzip / 1024).toFixed(2) + 'KB')}`);
        console.log(`${picocolors.gray('---------------------')}\n`);
    }
    else {
        console.log(picocolors.red(`could not find package: ${packageName}`));
    }
=======
import { createColors } from 'picocolors';

console.log('isTTY:', process.stdout.isTTY);
console.log('FORCE_COLOR:', process.env.FORCE_COLOR);

const picocolors = createColors(true);
// CLI-safe icons (emoji fallback)
// const icon = process.platform === 'win32' ? '>' : '🔎';
const icons = {
  search: process.platform === 'win32' ? '>' : '🔎',
  success: process.platform === 'win32' ? 'OK' : '✅',
  error: process.platform === 'win32' ? 'X' : '❌',
};

// Helper to show available colors
function showAvailableColors() {
  console.log('\nAvailable picocolors options:');
  console.log('-----------------------------');
  const colors = {
    'black': picocolors.black('black'),
    'red': picocolors.red('red'),
    'green': picocolors.green('green'),
    'yellow': picocolors.yellow('yellow'),
    'blue': picocolors.blue('blue'),
    'magenta': picocolors.magenta('magenta'),
    'cyan': picocolors.cyan('cyan'),
    'white': picocolors.white('white'),
    'gray': picocolors.gray('gray'),
    'bold': picocolors.bold('bold'),
    'italic': picocolors.italic('italic'),
    'underline': picocolors.underline('underline'),
    'inverse': picocolors.inverse('inverse'),
    'dim': picocolors.dim('dim'),
  };
  
  Object.entries(colors).forEach(([name, example]) => {
    console.log(`${picocolors.white(name.padEnd(12))}: ${example}`);
  });
  console.log('');
>>>>>>> dc141fe (Work in progress: partial CLI changes)
}

async function run() {
  // Show available colors if no arguments or --help flag
  if (process.argv.length < 3 || process.argv[2] === '--help') {
    console.log(picocolors.bold('Usage:'));
    console.log('  node cli.js <package-name>');
    console.log('  node cli.js --local');
    console.log('  node cli.js --colors  (show available colors)');
    console.log('');
    console.log(picocolors.bold('Examples:'));
    console.log('  node cli.js lodash');
    console.log('  node cli.js express');
    console.log('  node cli.js --local');
    console.log('');
    
    showAvailableColors();
    process.exit(0);
  }

  // Show just colors
  if (process.argv[2] === '--colors') {
    showAvailableColors();
    process.exit(0);
  }

  const packageName = process.argv[2];
  
  if (!packageName) {
    console.log(picocolors.yellow('Please provide a valid package name.'));
    console.log('Use --help for usage information.');
    process.exit(1);
  }

  // Local mode
  if (packageName === '--local') {
    try {
      const reader = await import('./package-json-reader.js');
      const pkg = reader.readPackageJson(process.cwd());
      const deps = reader.extractDependencies(pkg);
      
      console.log(picocolors.red('\n✅ Local package.json loaded!'));
      console.log(`${picocolors.yellow('Name:')}    ${pkg.name}`);
      console.log(`${picocolors.bold('Version:')} ${pkg.version}`);
      console.log(`${picocolors.bold('Deps:')}    ${Object.keys(deps).length}\n`);
    } catch (err) {
      console.log(picocolors.red(`Local mode error: ${err.message}`));
      process.exit(1);
    }
    return;
  }

console.log(picocolors.green(`${icon} Searching for... ${packageName}`));
console.log(picocolors.green(`${icons.search} Searching for... ${packageName}`));
console.log(picocolors.red(`${icons.error} Something went wrong`));
console.log(picocolors.green(`${icons.success} Done!`));

//   console.log(`${picocolors.green('🔎 Searching for me...')} ${packageName}`);
  console.log(picocolors.cyan("Searching without emoji"));
  
  const stats = await getRemotePackageSize(packageName);
  if (stats) {
    console.log(`\n${picocolors.bold(picocolors.blue(stats.name))}`);
    console.log(`${picocolors.gray('---------------------')}`);
    console.log(`Minified: ${picocolors.yellow((stats.size / 1024).toFixed(2) + 'KB⬆️')}`);
    console.log(`Gzipped: ${picocolors.green((stats.gzip / 1024).toFixed(2) + 'KB')}`);
    console.log(`${picocolors.gray('---------------------')}\n`);
  } else {
    console.log(picocolors.red(`Could not find package: ${packageName}`));
  }
}

run().catch(error => {
  console.error(picocolors.red('Unexpected error:'), error);
  process.exit(1);
});

