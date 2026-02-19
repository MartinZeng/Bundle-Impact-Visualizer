// 2
// import { getRemotePackageSize } from './analyzer.js';
// import { generateSizeDistribution } from './lib/statistics.js';
// import picocolors from 'picocolors';

// // Custom styled chart function
// function renderStyledChart(distribution: Record<string, number>) {
//   const maxCount = Math.max(...Object.values(distribution), 1);
// //  console.log(`${picocolors.gray('--------------------------------')}`);
//   console.log(`${picocolors.cyan('Package Size Distribution')}`);
//   console.log(`${picocolors.white('--------------------------------')}\n`);
//   // Define the categories in the order you want
//   const categories = ['0-25kb', '25-50kb', '50-100kb', '100kb+'];
  
//   for (const category of categories) {

//     const count = distribution[category] || 0;
//     const barLength = Math.round((count / maxCount) * 20);
//     const bar = picocolors.blue('█'.repeat(barLength));
//     const countDisplay = count > 0 
//       ? picocolors.yellow(`(${count})`) 
//       : picocolors.gray('(0)');
    
//     console.log(`${category.padEnd(10)} ${bar} ${countDisplay}`);
//   }
//   console.log('');
// }

// async function run() {
//   const packageName = process.argv[2];

//   if (!packageName) {
//     console.log(picocolors.yellow('please provide a valid package name.'));
//     process.exit(1);
//   }

//   // Local mode
//   if (packageName === '--local') {
//     try {
//       const reader = await import('./package-json-reader.js');

//       const pkg = reader.readPackageJson(process.cwd());
//       const deps = reader.extractDependencies(pkg);
      
//       console.log(
//         picocolors.cyan('\n✅ Local ') + 
//         picocolors.yellow('{} ') + 
//         picocolors.bold(picocolors.cyan('package.json ')) + 
//         picocolors.cyan('loaded')+(picocolors.yellow('!'))
//       );
//       console.log(`${picocolors.white('--------------------------------')}\n`);
//       console.log(`${picocolors.magenta('Name')}${picocolors.cyan(':')}    ${picocolors.blue(pkg.name)}`);
//       console.log(`${picocolors.white('--------------------------------')}\n`);
//       console.log(`${picocolors.magenta('Version')}${picocolors.cyan(':')}  ${picocolors.blue(pkg.version)}`);
//       console.log(`${picocolors.white('--------------------------------')}\n`);
//       console.log(`${picocolors.magenta('Packages')}${picocolors.cyan(':')} ${picocolors.blue(Object.keys(deps).length)}`);
//       console.log(`${picocolors.white('--------------------------------')}\n`);


//       const packageList = Object.entries(deps).map(([name, version]) => ({
//         name,
//         version,
//       }));

//       // Fetch sizes silently (no output)
//       const packageSizes = [];
//       for (const [index, pkg] of packageList.entries()) {
//         const sizeInfo = await getRemotePackageSize(pkg.name);
        
//         if (sizeInfo && (sizeInfo.size || sizeInfo.gzip)) {
//           const sizeInBytes = sizeInfo.size || sizeInfo.gzip || 0;
//           packageSizes.push({
//             name: pkg.name,
//             size: sizeInBytes
//           });
//         }
//       }

//       if (packageSizes.length > 0) {
//         // Size distribution chart
//         // console.log(`${picocolors.cyan('📊 Package Size Distribution:')}`);
//         const distribution = generateSizeDistribution(packageSizes);
        
//         // Use the styled chart
//         renderStyledChart(distribution);
        
//         console.log(`${picocolors.gray('================================')}`);
//         console.log(`${picocolors.green(`✅ Analyzed ${packageSizes.length} packages successfully`)}`);
//         if (packageSizes.length < packageList.length) {
//           console.log(picocolors.yellow(`⚠️  Could not fetch sizes for ${packageList.length - packageSizes.length} packages`));
//         }
//       } else {
//         console.log(picocolors.yellow('\n❌ No package sizes could be fetched for analysis'));
//       }

//     } catch (err: any) {
//       console.log(picocolors.red(`Local mode error: ${err.message}`));
//       process.exit(1);
//     }
//     return;
//   }

//   // Single package mode
//   console.log(`\n🔎 ${picocolors.cyan('Searching for')}...`);
//   console.log(`${picocolors.gray('===================')}`);
  
//   const stats = await getRemotePackageSize(packageName);

//   if (stats) {
//     if (!stats.isBundleable) {
//       console.log(
//         picocolors.bgRed(picocolors.white(' WARNING ')),
//         picocolors.red(
//           'This package is likely not bundleable (e.g., Node-only or CLI tool.)',
//         ),
//       );
//     }
//     console.log(`\n${picocolors.magenta(stats.name.charAt(0).toUpperCase() + stats.name.slice(1))}`);
//     console.log(`${picocolors.gray('-------------------')}`);
   
//     console.log(
//       `Minified: ${picocolors.yellow((stats.size / 1024).toFixed(2) + 'KB')}`,
//     );
//     console.log(`${picocolors.gray('-------------------')}`);
//     console.log(
//       `Gzipped:  ${picocolors.green((stats.gzip / 1024).toFixed(2) + 'KB')}`,
//     );
//     console.log(`${picocolors.gray('+++++++++++++++++++')}\n`);
//   } else {
//     console.log(picocolors.red(`could not find package: ${packageName}`));
//   }
// }

// run();




// 3
import { getRemotePackageSize } from './analyzer.js';
import { calculateStatistics, detectOutliers, generateInsights, generateSizeDistribution } from './lib/statistics.js';
import picocolors from 'picocolors';
import fs from 'fs';
import path from 'path';


function renderStyledChart(distribution: Record<string, number>) {
  console.log(picocolors.white('-------------------------------'));
 console.log('\n')
 const categories = ['0-25kb', '25-50kb', '50-100kb', '100kb+'];


 const counts = categories.map(cat => distribution[cat] || 0);
 const total = counts.reduce((sum, n) => sum + n, 0);


 const labelWidth = 8;
 const barWidth = 40; 
 const countWidth = 12;
 const percentWidth = 4;


 for (const category of categories) {
   const count = distribution[category] || 0;


   const percentage = total === 0 ? 0 : (count / total);


   const filledLength =
     count === 0
       ? 0
       : Math.max(1, Math.round(percentage * barWidth));


   const emptyLength = barWidth - filledLength;


   const filledBar = picocolors.blue('█'.repeat(filledLength));
   const emptyBar = picocolors.gray(''.repeat(emptyLength));


   const label = picocolors.white(category.padEnd(labelWidth));
   // const countText = picocolors.yellow(
   //   `(${count})`.padStart(countWidth)
   // );
   const percentText = picocolors.cyan(
     `${Math.round(percentage * 100)}%`.padStart(percentWidth)
   );


 //   console.log(`${label} ${filledBar}${emptyBar} ${countText} ${percentText}`);
 // }
console.log(`${label} ${filledBar}${emptyBar} ${percentText}`);
 }
 console.log(picocolors.gray('...............................'));
 console.log(
  `${picocolors.green('Total packages analyzed')}${picocolors.white(':')} ${picocolors.cyan(total)}\n`
);
}

async function run() {
 const packageName = process.argv[2];


 if (!packageName) {
   console.log(picocolors.yellow('please provide a valid package name.'));
   process.exit(1);
 }


 // Local mode
 if (packageName === '--local') {
   try {
     const reader = await import('./package-json-reader.js');


     const pkg = reader.readPackageJson(process.cwd());
     const deps = reader.extractDependencies(pkg);
    
     console.log(
       picocolors.cyan('\n✅ Local ') +
       picocolors.yellow('{}') +
       picocolors.bold(picocolors.cyan(' package.json')) +
       picocolors.cyan(' loaded') + picocolors.yellow('!')
     );
     console.log(`${picocolors.white('================================')}\n`);
    
     // Show actual package name and version from package.json
     console.log(`${picocolors.magenta('Name')}${picocolors.cyan(':')}    ${picocolors.blue(pkg.name)}`);
     console.log(`${picocolors.white('--------------------------------')}\n`);
     console.log(`${picocolors.magenta('Version')}${picocolors.cyan(':')} ${picocolors.blue(pkg.version)}`);
     console.log(`${picocolors.white('--------------------------------')}\n`);
     console.log(`${picocolors.magenta('Packages')}${picocolors.cyan(':')}${picocolors.blue(Object.keys(deps).length)}`);
     console.log(`${picocolors.white('================================')}`);


     // Show the list of dependencies with versions
    //  console.log(`${picocolors.gray('..............................')}`);
      console.log('\n');
     console.log(`${picocolors.cyan('📦 Dependencies')}`);
     console.log(`${picocolors.white('--------------------------------')}\n`);
      
     
     const packageList = Object.entries(deps).map(([name, version]) => ({
       name,
       version: version as string,
     }));
    
     packageList.forEach(({ name, version }) => {
       console.log(`  • ${picocolors.yellow(name)} ${picocolors.gray(version)}`);
     });
     console.log(`${picocolors.gray('--------------------------------')}`);


     // Show fetching indicator
     console.log(`${picocolors.cyan('📈 Analyzing package sizes...')}`);
    console.log(`${picocolors.white('--------------------------------')}\n`);

     // Fetch sizes for all dependencies with progress indicator
     const packageSizes = [];
     for (const [index, pkg] of packageList.entries()) {
       process.stdout.write(`  ${picocolors.gray(`[${index + 1}/${packageList.length}]`)} ${pkg.name}... `);
      
       const sizeInfo = await getRemotePackageSize(pkg.name);
      
       if (sizeInfo && (sizeInfo.size || sizeInfo.gzip)) {
         const sizeInBytes = sizeInfo.size || sizeInfo.gzip || 0;
         const sizeInKB = (sizeInBytes / 1024).toFixed(2);
         packageSizes.push({
           name: pkg.name,
           size: sizeInBytes
         });
         console.log(picocolors.green(`✓ ${picocolors.white(sizeInKB + ' KB')}`));
       } else {
         console.log(picocolors.yellow('✗ (size unknown)'));
       }
     }


     if (packageSizes.length > 0) {
       // Calculate statistics for insights and outliers
       const stats = calculateStatistics(packageSizes);
      
       // Detect outliers
       const outliers = detectOutliers(packageSizes, stats.mean);
       if (outliers && outliers.length > 0) {
         console.log(`${picocolors.gray('--------------------------------')}`);
         console.log(`\n${picocolors.cyan('⚠️  Potential outliers')}`);
         console.log(`${picocolors.white('--------------------------------')}\n`);
         outliers.forEach(pkg => {
           const sizeKB = (pkg.size / 1024).toFixed(2);
           console.log(`  • ${picocolors.white(pkg.name)}: ${picocolors.red(sizeKB + ' KB')}`);
         });
         console.log(`${picocolors.gray('--------------------------------')}`);
       }


       // Generate insights
       const insights = generateInsights(packageSizes, stats);
       console.log(`\n${picocolors.cyan('💡 Insights')}`);
       console.log(`${picocolors.white('--------------------------------')}\n`);
       if (Array.isArray(insights)) {
         insights.forEach(insight => {
           console.log(`  • ${picocolors.white(insight)}`);
         });
       } else if (typeof insights === 'string') {
         console.log(`  • ${picocolors.white(insights)}`);
       }
       
       console.log(`${picocolors.gray('--------------------------------')}`);


       // Size distribution chart
       console.log(`${picocolors.cyan('Package Size Distribution')}`);
       const distribution = generateSizeDistribution(packageSizes);
        renderStyledChart(distribution);
      
       console.log(`${picocolors.white('--------------------------------')}`);
       // console.log(`${picocolors.green(`✅ Analyzed ${packageSizes.length} packages successfully`)}`);
       if (packageSizes.length < packageList.length) {
         console.log(picocolors.yellow(`⚠️  Could not fetch sizes for ${packageList.length - packageSizes.length} packages`));
       }
     } else {
       console.log(picocolors.yellow('\n❌ No package sizes could be fetched for analysis'));
     }


   } catch (err: any) {
     console.log(picocolors.red(`Local mode error: ${err.message}`));
     process.exit(1);
   }
   return;
 }


 // Single package mode
 console.log(`\n🔎 ${picocolors.cyan('Searching for')}...`);
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
   console.log(`\n${picocolors.magenta(stats.name.charAt(0).toUpperCase() + stats.name.slice(1))}`);
   console.log(`${picocolors.gray('-------------------')}`);
 
   console.log(
    `${picocolors.blue('Minified')}: ${picocolors.yellow((stats.size / 1024).toFixed(2) + 'KB\⬆')}`
    );
    console.log(`${picocolors.white('---------------------')}`);
    console.log(
      `${picocolors.blue( 'Gzipped')}:  ${picocolors.green((stats.gzip / 1024).toFixed(2) + 'KB\⬇')}`,
    );
   
   
   console.log(`${picocolors.gray('--------------------------------')}\n`);
 } else {
   console.log(picocolors.red(`could not find package: ${packageName}`));
 }
}


run();

