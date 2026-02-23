export function sortBySize(packages) {
    return [...packages].sort((a, b) => {
        if (b.size !== a.size)
            return b.size - a.size;
        return a.name.localeCompare(b.name);
    });
}
export function getTopN(packages, n) {
    return packages.slice(0, n);
}
export function addRanking(packages) {
    return packages.map((pkg, index) => ({
        ...pkg,
        rank: index + 1,
    }));
}
