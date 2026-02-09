# Bundle Impact Visualizer (BIV)

## Overview

**Bundle Impact Visualizer (BIV)** is a development tool that helps developers understand the bundle-size impact of their dependencies in real-time. It provides immediate feedback on how each library or framework contributes to the final application bundle size, enabling informed decisions about dependencies during development.

## The Problem

Developers often add libraries and frameworks (like Tailwind, Bootstrap, Redux) to improve productivity, but lack clear feedback on how each addition impacts the final application bundle size. This leads to "dependency creep" where applications become bloated with unused code, resulting in slower page loads, poor performance on weak networks, and degraded user experience.

## The Solution

BIV integrates into your build process to measure and visualize the bundle-size impact of each dependency. It provides actionable insights that help developers make informed trade-offs between features and performance during development.

## MVP Features

- Visualize data size of dependencies and changes between commits through a basic display
- CLI tool that runs after builds to generate reports showing size contributions
- Terminal output showing bundle size analysis

## Current Commands

### Installation
```bash
npm i -g @mzeng062102/biv
```

### Available Commands

1. **Check local dependencies**
   ```bash
   biv --local
   ```
   Returns the number of dependencies, their names, and versions from your `package.json` file.

2. **Analyze specific package**
   ```bash
   biv [package_name]
   ```
   Returns bundled and gzipped file sizes for the specified package.

## Technology Stack

- **Core**: Node.js
- **Build Tool**: Vite (Development server)
- **Frontend**: React with TypeScript
- **Analysis**: webpack-bundle-analyzer (as a library)
- **Source Map Parsing**: source-map
- **Reporting**: Console table output or simple HTML file with charts
- **Visualization**: chart.js (for HTML output) or cli-table3 (for console output)


## Future Goals

- Refine frontend interface to match current design standards
- Add `--diff` flag to compare current bundle against previous builds
- Highlight size changes per dependency in real-time
- Create File-reader to read package.json

## Team Structure

- **Scrum**: Sarai
- **Product Owner**: Martin
- **Front-End/UI**: Denalo, Kai, Edward
- **Back-End/Core**: Martin, Sarai, Edward

## Getting Started

1. Install globally:
   ```bash
   npm i -g @mzeng062102/biv
   ```

2. Navigate to your project directory

3. Run analysis commands to understand your bundle impact

## Note

