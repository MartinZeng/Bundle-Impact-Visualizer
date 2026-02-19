// src/server/lib/test-statistics.ts
import { calculateStatistics, detectOutliers, generateInsights, generateSizeDistribution, renderAsciiChart } from './statistics.js';

const packages = [
  { name: 'pkg1', size: 5000 },
  { name: 'pkg2', size: 12000 },
  { name: 'pkg3', size: 3000 },
  { name: 'pkg4', size: 40000 },
];

const stats = calculateStatistics(packages);
console.log('Statistics:', stats);

const outliers = detectOutliers(packages, stats.mean);
console.log('Outliers:', outliers);


const insights = generateInsights(packages, stats);
console.log('Insights:', insights);


const distribution = generateSizeDistribution(packages);
renderAsciiChart(distribution);
