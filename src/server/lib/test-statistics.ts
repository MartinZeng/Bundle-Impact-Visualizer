// src/server/lib/test-statistics.ts
import { calculateStatistics, detectOutliers, generateInsights, generateSizeDistribution, renderAsciiChart } from './statistics.js';

// Example package data to test the functions
const packages = [
  { name: 'pkg1', size: 5000 },
  { name: 'pkg2', size: 12000 },
  { name: 'pkg3', size: 3000 },
  { name: 'pkg4', size: 40000 },
];

// 1️⃣ Calculate statistics
const stats = calculateStatistics(packages);
console.log('Statistics:', stats);

// 2️⃣ Detect outliers
const outliers = detectOutliers(packages, stats.mean);
console.log('Outliers:', outliers);

// 3️⃣ Generate insights
const insights = generateInsights(packages, stats);
console.log('Insights:', insights);

// 4️⃣ Generate and render ASCII size distribution
const distribution = generateSizeDistribution(packages);
renderAsciiChart(distribution);
