
import { fetchPackageData, PackageMetadata } from "./npm-api";

export interface BatchOptions {
  concurrency?: number;
  noCache?: boolean;
}

const cache = new Map<string, PackageMetadata>();


export async function fetchMultiplePackages(
  dependencies: string[],
  options: BatchOptions = {}
): Promise<PackageMetadata[]> {
  const concurrencyLimit = options.concurrency ?? 5;
  const results: PackageMetadata[] = new Array(dependencies.length);

  let currentIndex = 0;
  let completed = 0;

  async function worker() {
    while (currentIndex < dependencies.length) {
      const index = currentIndex++;
      const packageName = dependencies[index];

      console.log(
        `[${completed + 1}/${dependencies.length}] Fetching ${packageName}...`
      );

      try {
        const data = await fetchSingle(packageName, options);
        results[index] = data;
      } catch (error) {
        console.error(`Error fetching ${packageName}:`, error);
      }

      completed++;
    }
  }

  const workers = Array.from({ length: concurrencyLimit }, () => worker());

  await Promise.all(workers);

  return results;
}


async function fetchSingle(
  packageName: string,
  options: BatchOptions
): Promise<PackageMetadata> {
  if (!options.noCache && cache.has(packageName)) {
    return cache.get(packageName)!;
  }

  const data = await fetchPackageData(packageName);

  if (!options.noCache) {
    cache.set(packageName, data);
  }

  return data;
}
