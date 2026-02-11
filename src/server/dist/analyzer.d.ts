export declare function getRemotePackageSize(packageName: string): Promise<{
    name: any;
    size: any;
    gzip: any;
    description: any;
    isBundleable: boolean;
    version: any;
} | null>;
