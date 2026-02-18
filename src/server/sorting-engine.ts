export type PackageInfo = {
  name: string
  size: number
  version?: string
}

export function sortBySize(packages: PackageInfo[]) {
  return [...packages].sort((a, b) => {
    if (b.size !== a.size) return b.size - a.size
    return a.name.localeCompare(b.name)
  })
}

export function getTopN(packages: PackageInfo[], n: number = 5) {
  return packages.slice(0, n)
}

export function addRanking(packages: PackageInfo[]) {
  return packages.map((pkg, index) => ({
    ...pkg,
    rank: index + 1,
  }))
}