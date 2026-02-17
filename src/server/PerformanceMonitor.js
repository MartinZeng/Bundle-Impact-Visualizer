/**
 * Performance Monitor Module for BiV
 * Tracks timing of local operations and analyzes package size distribution
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            operations: [],        // Track local operations (file reads, parsing, etc.)
            totalStartTime: null,
            totalEndTime: null
        };
    }

    /**
     * Start the overall timer
     */
    startTotal() {
        this.metrics.totalStartTime = Date.now();
        console.log('⏱️  Performance monitoring started');
    }

    /**
     * End the overall timer
     */
    endTotal() {
        this.metrics.totalEndTime = Date.now();
    }

    /**
     * Track a local operation duration
     * @param {string} operationName - Name of operation (e.g., 'read package.json', 'parse dependencies')
     * @param {number} durationMs - Time taken in milliseconds
     */
    trackOperation(operationName, durationMs) {
        this.metrics.operations.push({
            operation: operationName,
            duration: durationMs,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get total execution time
     * @returns {number} Total time in milliseconds
     */
    getTotalTime() {
        if (!this.metrics.totalStartTime || !this.metrics.totalEndTime) {
            return 0;
        }
        return this.metrics.totalEndTime - this.metrics.totalStartTime;
    }

    /**
     * Helper to format bytes
     * @param {number} bytes 
     * @returns {string} Formatted size
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }

    /**
     * Calculate size distribution statistics from package.json
     * @param {Array} packages - Array of package objects with size property
     * @returns {Object} Distribution statistics
     */
    analyzeSizeDistribution(packages) {
        if (!packages || packages.length === 0) {
            return {
                average: 0,
                median: 0,
                min: 0,
                max: 0,
                total: 0,
                distribution: []
            };
        }

        // Extract sizes
        const sizes = packages.map(p => p.size).filter(s => s > 0);
        
        if (sizes.length === 0) {
            return {
                average: 0,
                median: 0,
                min: 0,
                max: 0,
                total: 0,
                distribution: []
            };
        }

        // Sort sizes for calculations
        const sortedSizes = [...sizes].sort((a, b) => a - b);
        
        // Calculate statistics
        const total = sizes.reduce((sum, size) => sum + size, 0);
        const average = total / sizes.length;
        const min = sortedSizes[0];
        const max = sortedSizes[sortedSizes.length - 1];
        
        // Calculate median
        const mid = Math.floor(sortedSizes.length / 2);
        const median = sortedSizes.length % 2 === 0
            ? (sortedSizes[mid - 1] + sortedSizes[mid]) / 2
            : sortedSizes[mid];

        // Calculate distribution tiers
        const distribution = [
            { tier: '0-100KB', count: 0, packages: [] },
            { tier: '100KB-500KB', count: 0, packages: [] },
            { tier: '500KB-1MB', count: 0, packages: [] },
            { tier: '1MB-5MB', count: 0, packages: [] },
            { tier: '5MB+', count: 0, packages: [] }
        ];

        packages.forEach(pkg => {
            const sizeKB = pkg.size / 1024; // Convert to KB
            
            if (sizeKB < 100) {
                distribution[0].count++;
                distribution[0].packages.push(pkg.name);
            } else if (sizeKB < 500) {
                distribution[1].count++;
                distribution[1].packages.push(pkg.name);
            } else if (sizeKB < 1000) {
                distribution[2].count++;
                distribution[2].packages.push(pkg.name);
            } else if (sizeKB < 5000) {
                distribution[3].count++;
                distribution[3].packages.push(pkg.name);
            } else {
                distribution[4].count++;
                distribution[4].packages.push(pkg.name);
            }
        });

        return {
            average: Math.round(average),
            median: Math.round(median),
            min,
            max,
            total,
            packageCount: sizes.length,
            distribution
        };
    }

    /**
     * Find outliers (packages significantly larger than average)
     * @param {Array} packages - Array of package objects
     * @param {number} thresholdMultiplier - Multiplier for average (default: 2)
     * @returns {Array} Outlier packages
     */
    findOutliers(packages, thresholdMultiplier = 2) {
        if (!packages || packages.length === 0) return [];
        
        const sizes = packages.map(p => p.size);
        const average = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
        const threshold = average * thresholdMultiplier;
        
        return packages
            .filter(pkg => pkg.size > threshold)
            .map(pkg => ({
                name: pkg.name,
                size: pkg.size,
                formattedSize: this.formatBytes(pkg.size),
                ratio: (pkg.size / average).toFixed(2),
                threshold: this.formatBytes(threshold)
            }));
    }

    /**
     * Generate performance report for BiV
     * @param {Array} packages - Array of package data from package.json
     * @param {Object} options - Options including verbose flag
     * @returns {Object} Formatted performance report
     */
    generatePerformanceReport(packages, options = {}) {
        const verbose = options.verbose || false;
        
        // Calculate operation stats
        const operationStats = {
            total: this.metrics.operations.length,
            averageTime: 0,
            slowest: null,
            fastest: null
        };

        if (this.metrics.operations.length > 0) {
            const times = this.metrics.operations.map(o => o.duration);
            operationStats.averageTime = Math.round(
                times.reduce((sum, t) => sum + t, 0) / times.length
            );
            operationStats.slowest = this.metrics.operations.reduce(
                (max, o) => o.duration > (max?.duration || 0) ? o : max, 
                null
            );
            operationStats.fastest = this.metrics.operations.reduce(
                (min, o) => o.duration < (min?.duration || Infinity) ? o : min,
                null
            );
        }

        // Get size distribution
        const distribution = this.analyzeSizeDistribution(packages);
        
        // Find outliers
        const outliers = this.findOutliers(packages);

        // Build report
        const report = {
            summary: {
                totalTime: this.getTotalTime(),
                totalTimeFormatted: `${this.getTotalTime()}ms`,
                packageCount: packages.length,
                operations: operationStats.total,
                timestamp: new Date().toISOString()
            },
            performance: verbose ? {
                operations: this.metrics.operations.map(op => ({
                    operation: op.operation,
                    duration: `${op.duration}ms`,
                    timestamp: op.timestamp
                })),
                averages: operationStats
            } : {
                totalTime: `${this.getTotalTime()}ms`,
                averageOperationTime: `${operationStats.averageTime}ms`
            },
            sizeAnalysis: {
                distribution: distribution.distribution.map(d => ({
                    tier: d.tier,
                    count: d.count,
                    percentage: packages.length > 0 
                        ? `${Math.round((d.count / packages.length) * 100)}%`
                        : '0%',
                    // Only include package names in verbose mode
                    packages: verbose ? d.packages : undefined
                })),
                statistics: {
                    average: this.formatBytes(distribution.average),
                    median: this.formatBytes(distribution.median),
                    min: this.formatBytes(distribution.min),
                    max: this.formatBytes(distribution.max),
                    total: this.formatBytes(distribution.total)
                },
                outliers: outliers.map(o => ({
                    name: o.name,
                    size: o.formattedSize,
                    ratio: `${o.ratio}x average`
                }))
            }
        };

        return report;
    }
}



// Export the class
export default PerformanceMonitor;