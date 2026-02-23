#!/usr/bin/env node
import { getRemotePackageSize } from './analyzer.js';
import { ALTERNATIVES } from './suggestions.js';
import { parseNpmResponse } from './package-data-parser.js';
import { readPackageJson, extractDependencies } from './package-json-reader.js';
import { sortBySize, getTopN, addRanking } from './sorting-engine.js';
import { exportToCsv, exportToJson, formatSize } from './export-manager.js';
import picocolors from 'picocolors';
import { json } from 'node:stream/consumers';

async function run() {
  const args = process.argv.slice(2);
  const command = args[0];

  const jsonIndex = args.indexOf('--json');
  const csvIndex = args.indexOf('--csv');

  const jsonPath = jsonIndex !== -1 ? args[jsonIndex + 1] : null;
  const csvPath = csvIndex !== -1 ? args[csvIndex + 1] : null;

  const cleanArgs = args.filter((_, i) => {
    i !== jsonIndex &&
      i !== jsonIndex + 1 &&
      i !== csvIndex &&
      i !== csvIndex + 1;
  });

  if (!command) {
    console.log(
      picocolors.yellow(
        'Usage: biv <package> | biv info <package> | biv top [n] | biv --local',
      ),
    );
    process.exit(1);
  }

  switch (command) {
    case 'info':
      await handleInfoCommand(args[1]);
      break;

    case '--local':
      await handleLocalCommand();
      break;

    case 'top':
      await handleTopCommand(cleanArgs[1], { jsonPath, csvPath });
      break;

    default:
      // If no recognized command, assume the first arg is a package name to search
      await handleSearchCommand(command);
      break;
  }
}

async function handleInfoCommand(packageName: string) {
  if (!packageName)
    return console.log(
      picocolors.red('Error: Provide a package name (biv info <pkg>)'),
    );
  try {
    console.log(
      picocolors.cyan(`Fetching registry info for ${packageName}...`),
    );
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);

    if (!response.ok)
      throw new Error(`Package "${packageName}" not found on npm.`);

    const rawData = await response.json();
    const info = parseNpmResponse(rawData);

    console.log(`\n${picocolors.bold(picocolors.green(info.name))}`);
    console.log(`${picocolors.gray('---------------------------------')}`);
    console.log(`${picocolors.bold('Version:')}      ${info.version}`);
    console.log(
      `${picocolors.bold('Unpacked Size:')} ${picocolors.yellow((info.size / 1024 / 1024).toFixed(2) + ' MB')}`,
    );
    console.log(
      `${picocolors.bold('Last Updated:')}  ${new Date(info.lastUpdated).toLocaleDateString()}`,
    );
    console.log(`${picocolors.gray('---------------------------------')}\n`);
  } catch (err: any) {
    console.log(picocolors.red(`Registry Error: ${err.message}`));
  }
  return;
}

async function handleLocalCommand() {
  try {
    const reader = await import('./package-json-reader.js');

    const pkg = reader.readPackageJson(process.cwd());

    const deps = reader.extractDependencies(pkg);

    console.log(picocolors.green('Local package.json loaded!'));
    console.log(`${picocolors.bold('Name:')}     ${pkg.name}`);
    console.log(`${picocolors.bold('Version:')}  ${pkg.version}`);
    console.log(
      `${picocolors.bold('Packages:')} ${Object.keys(deps).length}\n`,
    );
  } catch (err: any) {
    console.log(picocolors.red(`Local mode error: ${err.message}`));
    process.exit(1);
  }
  return;
}

async function handleSearchCommand(packageName: string) {
  console.log(picocolors.cyan(`searching for ${packageName}`));

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
    console.log(`\n${picocolors.bold(picocolors.green(stats.name))}`);

    const suggestion = ALTERNATIVES[stats.name?.toLowerCase()];
    if (suggestion) {
      console.log(
        picocolors.cyan('💡 Suggestion: ') +
          `Consider using ${picocolors.bold(suggestion.replacement)}`,
      );
      console.log(picocolors.gray(`   Reason: ${suggestion.reason}\n`));
    }

    console.log(`${picocolors.gray('---------------------')}`);
    if (stats.size > 1024) {
      console.log(
        `Minified: ${picocolors.yellow((stats.size / 1000000).toFixed(2) + 'MB')}`,
      );
    } else {
      console.log(
        `Minified: ${picocolors.yellow((stats.size / 1024).toFixed(2) + 'KB')}`,
      );
    }

    console.log(
      `Gzipped: ${picocolors.green((stats.gzip / 1024).toFixed(2) + 'KB')}`,
    );
    console.log(`${picocolors.gray('---------------------')}\n`);
  } else {
    console.log(picocolors.red(`could not find package: ${packageName}`));
  }
}

async function handleTopCommand(
  limitArg: string,
  exports: { jsonPath?: string | null; csvPath?: string | null },
) {
  const limit = parseInt(limitArg) || 5;
  try {
    const pkg = readPackageJson(process.cwd());
    const deps = extractDependencies(pkg);
    const depNames = Object.keys(deps);

    if (depNames.length === 0) {
      console.log(picocolors.yellow('No dependencies found in package.json.'));
      return;
    }

    console.log(picocolors.cyan(`Retrieving top ${limit} dependencies...`));

    // Use Promise.all to fetch all sizes concurrently
    const results = await Promise.all(
      depNames.map(async (name) => {
        try {
          const stats = await getRemotePackageSize(name);
          return stats ? { name: stats.name, size: stats.size } : null;
        } catch {
          return null; // Skip packages that fail to fetch
        }
      }),
    );

    const validResults = results.filter(
      (r): r is { name: string; size: number } => r !== null,
    );
    const sorted = sortBySize(validResults);
    const topDeps = addRanking(getTopN(sorted, limit));

    console.log(
      `\n${picocolors.bold(picocolors.underline('Dependency Leaderboard'))}`,
    );

    const exportData = topDeps.map((pkg) => ({
      rank: pkg.rank,
      name: pkg.name,
      version: pkg.version || 'N/A',
      rawSize: pkg.size,
      formattedSize: formatSize(pkg.size),
    }));

    if (exports.jsonPath) {
      exportToJson(exportData, exports.jsonPath);
      console.log(
        picocolors.green(`\n JSON report saved to ${exports.jsonPath}`),
      );
    }
    if (exports.csvPath) {
      exportToCsv(exportData, exports.csvPath);
      console.log(
        picocolors.green(`\n CSV report saved to ${exports.csvPath}`),
      );
    }

    topDeps.forEach((pkg) => {
      const sizeMB = (pkg.size / (1024 * 1024)).toFixed(2);
      console.log(
        `${picocolors.gray(pkg.rank + '.')} ${picocolors.bold(pkg.name.padEnd(20))} ${picocolors.yellow(sizeMB + ' MB')}`,
      );
    });
    console.log('');
  } catch (err: any) {
    console.log(picocolors.red(`Error: ${err.message}`));
  }
  return;
}

run();
