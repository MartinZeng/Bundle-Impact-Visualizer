export interface PackageMetadata {
  name: string;
  version: string;
  size?: number;
  dependencies?: Record<string, string>;
}

export async function fetchPackageData(
  packageName: string
): Promise<PackageMetadata> {
  const response = await fetch(`https://registry.npmjs.org/${packageName}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${packageName}`);
  }

  const data = await response.json();

  const latestVersion = data["dist-tags"].latest;
  const latest = data.versions[latestVersion];

  return {
    name: data.name,
    version: latestVersion,
    size: latest.dist?.unpackedSize,
    dependencies: latest.dependencies || {},
  };
}