export declare function getPackageManifest(packageName: string): Promise<{
    name: any;
    version: any;
    size: any;
    lastUpdated: any;
} | null>;
export declare function getRemotePackageSize(packageName: string): Promise<{
    name: any;
    size: any;
    gzip: any;
    description: any;
    isBundleable: boolean;
    version: any;
} | null>;
