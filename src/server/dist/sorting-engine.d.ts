export type PackageInfo = {
    name: string;
    size: number;
    version?: string;
};
export declare function sortBySize(packages: PackageInfo[]): PackageInfo[];
export declare function getTopN(packages: PackageInfo[], n: number): PackageInfo[];
export declare function addRanking(packages: PackageInfo[]): {
    rank: number;
    name: string;
    size: number;
    version?: string;
}[];
