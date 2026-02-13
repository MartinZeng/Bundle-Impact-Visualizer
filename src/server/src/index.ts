import { fetchMultiplePackages } from './lib/batch-processor';

async function main() {
  const packages = await fetchMultiplePackages(
    ['express', 'react', 'lodash'],
    { concurrency: 3 }
  );
  console.log(packages);
}

main();