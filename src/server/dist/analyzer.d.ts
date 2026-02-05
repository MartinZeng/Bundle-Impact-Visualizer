export declare function analyzeModuleSize(code: string, id: string): Promise<number | undefined>;
export declare function getRemotePackageSize(packageName: string): Promise<{
    name: any;
    size: any;
    gzip: any;
    description: any;
} | null>;
