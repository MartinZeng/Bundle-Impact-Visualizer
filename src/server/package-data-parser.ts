export type NormalizedPackageData = {
  name: string;
  size: number; // bytes
  version: string;
  lastUpdated: string; // ISO date string
};

export function parseNpmResponse(metadata: any): NormalizedPackageData {
  // Basic validation
  if (!metadata || typeof metadata !== "object") {
    throw new Error("Invalid metadata: expected an object");
  }

  // name
  let name = "";
  if (typeof metadata.name === "string") {
    name = metadata.name.trim();
  }
  if (!name) {
    throw new Error("Invalid metadata: missing name");
  }

  // version
  let version = "";
  if (typeof metadata.version === "string") {
    version = metadata.version.trim();
  }
  if (!version) {
    throw new Error("Invalid metadata: missing version");
  }

  // size (fallback strategy)
  let size = 0;

  if (metadata.dist && typeof metadata.dist === "object") {
    if (typeof metadata.dist.unpackedSize === "number" && metadata.dist.unpackedSize >= 0) {
      size = metadata.dist.unpackedSize;
    } else if (typeof metadata.dist.size === "number" && metadata.dist.size >= 0) {
      size = metadata.dist.size;
    }
  }

  // Another fallback (just in case)
  if (size === 0 && typeof metadata.size === "number" && metadata.size >= 0) {
    size = metadata.size;
  }

  //  lastUpdated (safe fallback)
  let lastUpdated = new Date().toISOString();

  if (metadata.time && typeof metadata.time === "object") {
    if (typeof metadata.time.modified === "string") {
      lastUpdated = metadata.time.modified;
    } else if (metadata.time[version] && typeof metadata.time[version] === "string") {
      lastUpdated = metadata.time[version];
    }
  }

  return { name, size, version, lastUpdated };
}
