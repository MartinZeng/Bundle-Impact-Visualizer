import { fetchMultiplePackages } from './lib/batch-processor';

async function test() {
  try {
    const packages = await fetchMultiplePackages(
      ['express', 'react', 'lodash'],
      { concurrency: 3 }
    );
    console.log('Results:', JSON.stringify(packages, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();