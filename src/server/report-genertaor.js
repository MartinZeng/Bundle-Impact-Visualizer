/**
 * Report Generator Module for BiV
 * Creates formatted reports from package.json analysis data
 */

class ReportGenerator {
    constructor() {
        this.version = '1.0.0';
    }

    /**
     * Format bytes to human readable
     * @param {number} bytes 
     * @returns {string}
     */
    formatBytes(bytes) {
        if (bytes === 0 || !bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }

    /**
     * Get current environment info
     * @returns {Object} Environment information
     */
    getEnvironmentInfo() {
        return {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            cwd: process.cwd(),
            timestamp: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    /**
     * Generate summary section from package.json data
     * @param {Array} packages - Package data from package.json
     * @param {Object} packageJson - Original package.json contents
     * @returns {Object} Summary section
     */
    generateSummary(packages, packageJson = {}) {
        const totalSize = packages.reduce((sum, pkg) => sum + (pkg.size || 0), 0);
        const totalPackages = packages.length;
        
        // Calculate average size (excluding zero-size packages)
        const packagesWithSize = packages.filter(p => p.size > 0);
        const averageSize = packagesWithSize.length > 0
            ? totalSize / packagesWithSize.length
            : 0;

        // Find largest and smallest
        const sortedBySize = [...packages].sort((a, b) => (b.size || 0) - (a.size || 0));
        const largest = sortedBySize[0] || null;
        const smallest = sortedBySize[sortedBySize.length - 1] || null;

        // Get project name from package.json
        const projectName = packageJson.name || 'unknown-project';
        const projectVersion = packageJson.version || '1.0.0';

        return {
            projectName,
            projectVersion,
            totalPackages,
            packagesWithSize: packagesWithSize.length,
            packagesWithoutSize: totalPackages - packagesWithSize.length,
            totalSize: this.formatBytes(totalSize),
            totalSizeBytes: totalSize,
            averageSize: this.formatBytes(averageSize),
            averageSizeBytes: averageSize,
            largestPackage: largest ? {
                name: largest.name,
                size: this.formatBytes(largest.size),
                sizeBytes: largest.size
            } : null,
            smallestPackage: smallest ? {
                name: smallest.name,
                size: this.formatBytes(smallest.size),
                sizeBytes: smallest.size
            } : null
        };
    }

    /**
     * Generate top packages section
     * @param {Array} packages - Package data
     * @param {number} limit - Number of top packages to show
     * @param {Object} totalInfo - Total size information
     * @returns {Array} Top packages section
     */
    generateTopPackages(packages, limit = 5, totalInfo) {
        const sortedPackages = [...packages]
            .filter(p => p.size > 0)
            .sort((a, b) => b.size - a.size)
            .slice(0, limit);

        return sortedPackages.map((pkg, index) => {
            const percentage = totalInfo.totalSizeBytes > 0
                ? ((pkg.size / totalInfo.totalSizeBytes) * 100).toFixed(2)
                : '0.00';

            return {
                rank: index + 1,
                name: pkg.name,
                version: pkg.version || 'unknown',
                size: this.formatBytes(pkg.size),
                sizeBytes: pkg.size,
                percentage: `${percentage}%`,
                // Add visual bar for CLI display
                bar: this.generateProgressBar(parseFloat(percentage), 20)
            };
        });
    }

    /**
     * Generate a progress bar for visual display
     * @param {number} percentage - Percentage value (0-100)
     * @param {number} length - Length of the bar
     * @returns {string} ASCII progress bar
     */
    generateProgressBar(percentage, length = 20) {
        const filled = Math.round((percentage / 100) * length);
        const empty = length - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }

    /**
     * Generate insights from package.json data
     * @param {Array} packages - Package data
     * @param {Object} summary - Summary information
     * @param {Object} packageJson - Original package.json for additional context
     * @returns {Array} List of insights
     */
    generateInsights(packages, summary, packageJson = {}) {
        const insights = [];
        const sortedPackages = [...packages].sort((a, b) => b.size - a.size);

        // Insight 1: Dependency count
        if (packages.length === 0) {
            insights.push({
                type: 'info',
                title: 'No Dependencies',
                message: 'No production dependencies found in package.json',
                suggestion: 'This might be a library or application with no external deps'
            });
        } else if (packages.length > 20) {
            insights.push({
                type: 'warning',
                title: 'Many Dependencies',
                message: `You have ${packages.length} production dependencies`,
                suggestion: 'Review if all are necessary or consider code splitting'
            });
        }

        // Insight 2: Size concentration (if we have packages with size data)
        if (packages.length >= 3 && summary.totalSizeBytes > 0) {
            const packagesWithSize = packages.filter(p => p.size > 0);
            if (packagesWithSize.length >= 3) {
                const top3Total = sortedPackages.slice(0, 3).reduce((sum, p) => sum + (p.size || 0), 0);
                const top3Percentage = (top3Total / summary.totalSizeBytes) * 100;
                
                if (top3Percentage > 60) {
                    insights.push({
                        type: 'warning',
                        title: 'High Concentration',
                        message: `Top 3 packages make up ${top3Percentage.toFixed(1)}% of total estimated size`,
                        topPackages: sortedPackages.slice(0, 3).map(p => p.name).join(', '),
                        suggestion: 'Consider if all top packages are necessary'
                    });
                }
            }
        }

        // Insight 3: Outliers (packages significantly larger than average)
        const packagesWithSize = packages.filter(p => p.size > 0);
        if (packagesWithSize.length > 2) {
            const sizes = packagesWithSize.map(p => p.size);
            const avg = sizes.reduce((a, b) => a + b, 0) / sizes.length;
            const outliers = packagesWithSize.filter(p => p.size > avg * 2.5);
            
            outliers.forEach(pkg => {
                insights.push({
                    type: 'info',
                    title: 'Large Package Detected',
                    message: `${pkg.name} is ${(pkg.size / avg).toFixed(1)}x larger than average`,
                    suggestion: 'Check for lighter alternatives or tree-shaking options'
                });
            });
        }

        // Insight 4: Dev vs Production (from package.json)
        if (packageJson.devDependencies) {
            const devCount = Object.keys(packageJson.devDependencies).length;
            if (devCount > packages.length) {
                insights.push({
                    type: 'tip',
                    title: 'More Dev Dependencies',
                    message: `You have ${devCount} devDependencies and ${packages.length} production deps`,
                    suggestion: 'Good separation of dev and production dependencies'
                });
            }
        }

        // Insight 5: Version patterns (check for outdated or wildcard versions)
        const wildcardVersions = packages.filter(p => 
            p.version && (p.version.includes('*') || p.version.includes('^') || p.version.includes('~'))
        );
        if (wildcardVersions.length > 0) {
            insights.push({
                type: 'info',
                title: 'Flexible Versions',
                message: `${wildcardVersions.length} package(s) use ^, ~, or * version ranges`,
                packages: wildcardVersions.slice(0, 3).map(p => `${p.name} (${p.version})`).join(', '),
                suggestion: 'Consider locking versions for consistent builds'
            });
        }

        return insights;
    }

    /**
     * Generate dependency tree summary
     * @param {Array} packages - Package data
     * @returns {Object} Tree summary
     */
    generateTreeSummary(packages) {
        // Group by scope/organization
        const byScope = {};
        packages.forEach(pkg => {
            if (pkg.name.startsWith('@')) {
                const scope = pkg.name.split('/')[0];
                byScope[scope] = byScope[scope] || [];
                byScope[scope].push(pkg);
            }
        });

        return {
            totalPackages: packages.length,
            scopedPackages: Object.keys(byScope).length,
            scopes: Object.keys(byScope).map(scope => ({
                scope,
                count: byScope[scope].length,
                totalSize: this.formatBytes(
                    byScope[scope].reduce((sum, p) => sum + (p.size || 0), 0)
                )
            }))
        };
    }

    /**
     * Main method to generate complete report from package.json analysis
     * @param {Object} analysisData - Data from package.json analysis
     * @param {Object} options - Report options (detail level, etc.)
     * @returns {Object} Complete formatted report
     */
    generateReport(analysisData, options = {}) {
        const {
            detailLevel = 'detailed', // 'simple', 'detailed', 'verbose'
            topN = 5,
            includeEnv = true,
            includeInsights = true,
            includeTree = false,
            format = 'object' // 'object', 'json', 'text'
        } = options;

        const packages = analysisData.packages || [];
        const packageJson = analysisData.packageJson || {};
        const performanceData = analysisData.performance || {};

        // Generate core sections
        const summary = this.generateSummary(packages, packageJson);
        const topPackages = this.generateTopPackages(packages, topN, summary);
        
        // Build report object
        const report = {
            metadata: {
                generatedAt: new Date().toISOString(),
                version: this.version,
                detailLevel,
                tool: 'BiV - Bundle Impact Visualizer'
            }
        };

        // Always include summary
        report.summary = summary;

        // Add sections based on detail level
        if (detailLevel !== 'simple') {
            report.topPackages = topPackages;
        }

        if (detailLevel === 'verbose') {
            // Full package list in verbose mode
            report.allPackages = packages.map(p => ({
                name: p.name,
                version: p.version,
                size: this.formatBytes(p.size),
                sizeBytes: p.size,
                // Add size category
                category: this.getSizeCategory(p.size)
            }));

            // Add package.json info
            report.packageJson = {
                name: packageJson.name,
                version: packageJson.version,
                description: packageJson.description,
                main: packageJson.main,
                scripts: packageJson.scripts ? Object.keys(packageJson.scripts) : []
            };
        }

        if (includeTree && detailLevel === 'verbose') {
            report.dependencyTree = this.generateTreeSummary(packages);
        }

        if (includeInsights && detailLevel !== 'simple') {
            report.insights = this.generateInsights(packages, summary, packageJson);
        }

        if (includeEnv && detailLevel === 'verbose') {
            report.environment = this.getEnvironmentInfo();
        }

        // Include performance data if available
        if (performanceData && Object.keys(performanceData).length > 0) {
            report.performance = performanceData;
        }

        // Return in requested format
        if (format === 'json') {
            return JSON.stringify(report, null, 2);
        } else if (format === 'text') {
            return this.formatAsText(report);
        }

        return report;
    }

    /**
     * Get size category for a package
     * @param {number} size - Size in bytes
     * @returns {string} Category
     */
    getSizeCategory(size) {
        if (!size || size === 0) return 'unknown';
        const kb = size / 1024;
        if (kb < 10) return 'tiny';
        if (kb < 100) return 'small';
        if (kb < 500) return 'medium';
        if (kb < 1000) return 'large';
        return 'very large';
    }

    /**
     * Format report as human-readable text for CLI output
     * @param {Object} report - Report object
     * @returns {string} Formatted text report
     */
    formatAsText(report) {
        let output = [];
        
        // Header
        output.push('\n' + '='.repeat(60));
        output.push(' BiV - BUNDLE IMPACT VISUALIZER');
        output.push('='.repeat(60));
        
        // Project Info
        output.push(`\n Project: ${report.summary.projectName} v${report.summary.projectVersion}`);
        output.push(` Generated: ${new Date(report.metadata.generatedAt).toLocaleString()}`);
        
        // Summary
        output.push('\n SUMMARY');
        output.push('-'.repeat(40));
        output.push(`Total Dependencies: ${report.summary.totalPackages}`);
        output.push(`Total Estimated Size: ${report.summary.totalSize}`);
        output.push(`Average Size: ${report.summary.averageSize}`);
        
        if (report.summary.largestPackage) {
            output.push(`Largest: ${report.summary.largestPackage.name} (${report.summary.largestPackage.size})`);
        }
        
        // Top Packages
        if (report.topPackages && report.topPackages.length > 0) {
            output.push('\n TOP PACKAGES BY SIZE');
            output.push('-'.repeat(40));
            report.topPackages.forEach(pkg => {
                output.push(`${pkg.rank}. ${pkg.name} @${pkg.version}`);
                output.push(`   Size: ${pkg.size} [${pkg.bar}] ${pkg.percentage} of total`);
            });
        }
        
        // Insights
        if (report.insights && report.insights.length > 0) {
            output.push('\n INSIGHTS');
            output.push('-'.repeat(40));
            report.insights.forEach(insight => {
                output.push(`${insight.icon} ${insight.title}`);
                output.push(`   ${insight.message}`);
                if (insight.suggestion) {
                    output.push(`   → ${insight.suggestion}`);
                }
            });
        }
        
        // Performance (if available)
        if (report.performance) {
            output.push('\n⚡ PERFORMANCE');
            output.push('-'.repeat(40));
            output.push(`Analysis Time: ${report.performance.summary?.totalTimeFormatted || 'N/A'}`);
        }
        
        // Footer
        output.push('\n' + '='.repeat(60));
        output.push(`✨ Run with --verbose for more details`);
        output.push('='.repeat(60) + '\n');
        
        return output.join('\n');
    }

    /**
     * Generate a quick preview for CLI
     * @param {Object} report - Report object
     * @returns {string} One-line preview
     */
    generatePreview(report) {
        const summary = report.summary;
        return `${summary.projectName}: ${summary.totalPackages} deps, ${summary.totalSize} total`;
    }
}

module.exports = ReportGenerator;