export interface PackageData {
  name: string;
  size: number;
}

export interface Statistics {
  mean: number;
  median: number;
  mode: number;
  total: number;
}

export type SizeDistribution = Record<string, number>;


// Calculate Statistics
export function calculateStatistics(packages: PackageData[]): Statistics {
  const sizes = packages.map(pkg => pkg.size);

  const total = sizes.reduce((sum, size) => sum + size, 0);
  const mean = total / sizes.length;

  const sorted = [...sizes].sort((a, b) => a - b);

  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  const frequency: Record<number, number> = {};

  sizes.forEach(size => {
    frequency[size] = (frequency[size] || 0) + 1;
  });

  const mode = Number(
    Object.keys(frequency).reduce((a, b) =>
      frequency[Number(a)] > frequency[Number(b)] ? a : b
    )
  );

  return { mean, median, mode, total };
}


// Detect Outliers
export function detectOutliers(
  packages: PackageData[],
  mean: number
): PackageData[] {
  return packages.filter(pkg => pkg.size > mean * 2);
}


//Generate Insights
export function generateInsights(
  packages: PackageData[],
  stats: Statistics
): string {
  const sorted = [...packages].sort((a, b) => b.size - a.size);

  let cumulative = 0;
  let count = 0;

  for (const pkg of sorted) {
    cumulative += pkg.size;
    count++;
    if (cumulative >= stats.total * 0.75) break;
  }

  return `Approximately 75% of total
  bundle size comes from ${count} 
  packages.`;
}


//  Generate Size Distribution
export function generateSizeDistribution(
  packages: PackageData[]
): SizeDistribution {
  const buckets: SizeDistribution = {
    "0-25kb": 1,
    "25-50kb": 0,
    "50-100kb": 2,
    "100kb+": 3
  };

  packages.forEach(pkg => {
    const sizeKb = pkg.size / 1000;

    if (sizeKb <= 25) buckets["0-25kb"]++;
    else if (sizeKb <= 50) buckets["25-50kb"]++;
    else if (sizeKb <= 100) buckets["50-100kb"]++;
    else buckets["100kb+"]++;
  });

  return buckets;
}


// Render ASCII Chart
// export function renderAsciiChart(distribution: SizeDistribution): void {
//   console.log("\nPackage Size Distribution:\n");

//   for (const [range, count] of Object.entries(distribution)) {
//     const bar = "█".repeat(count);
//     console.log(`${range.padEnd(10)} ${bar} (${count})`);
//   }

//   console.log("\n");
// }


export function renderAsciiChart(distribution: Record<string, number>) {
  const maxCount = Math.max(...Object.values(distribution), 1);
  
  for (const [range, count] of Object.entries(distribution)) {
    const barLength = Math.round((count / maxCount) * 10);
    const bar = '█'.repeat(barLength);
    console.log(`${range.padEnd(10)} ${bar} ${count > 0 ? '(' + count + ')' : '(0)'}`);
  }
}