export function parseNpmResponse(metadata: any) {
  const latestVersion = metadata['dist-tags']?.latest;
  const versionData = metadata.versions?.[latestVersion];

  if (!versionData) throw new Error('Could not find version data');

  const lastUpdated = metadata.time?.[latestVersion] || metadata.time?.modified;

  if (!lastUpdated) {
    console.warn(' Timestamp missing from registry response');
  }

  return {
    name: metadata.name,
    version: latestVersion,
    size: versionData.dist?.unpackedSize || 0,
    lastUpdated: lastUpdated || new Date(0).toISOString(), // Use epoch as fallback instead of today
  };
}
