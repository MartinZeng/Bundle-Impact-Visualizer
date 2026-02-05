import { describe, it, expect } from 'vitest';
import { analyzeModuleSize } from './analyzer.js';
import { getRemotePackageSize } from './analyzer.js';
import * as fs from 'fs';
import * as path from 'node:path';
describe('analyzeModuleSize', () => {
    it('should transform raw code to byte size', async () => {
        const rawCode = `function add(a, b) {
      console.log('Development log');
      return a + b;
    }`;
        //size is 61 bytes
        const size = await analyzeModuleSize(rawCode, 'test.js');
        expect(size).toBeLessThan(rawCode.length);
        expect(size).toBeGreaterThan(0);
    });
    it('should transform picocolors dependency to byte size', async () => {
        const picoPath = path.resolve(__dirname, 'node_modules/picocolors/picocolors.js');
        //raw code of node_modules/picocolors/picocolors.js
        const code = fs.readFileSync(picoPath, 'utf-8');
        //2067 bytes = 2.067 kilobytes
        const size = await analyzeModuleSize(code, 'picocolors.js');
        expect(size).toBeLessThan(2068);
        expect(size).toBeGreaterThan(0);
    });
});
describe('Remote Package Analyzer', () => {
    it('should fetch real data for lodash package', async () => {
        const data = await getRemotePackageSize('lodash');
        expect(data).not.toBeNull();
        expect(data?.name).toBe('lodash');
        expect(data?.size).toBeGreaterThan(20000);
        console.log('lodash size:', data.size);
        console.log(data);
    });
    it('should return null for non-existant package', async () => {
        const data = await getRemotePackageSize('jafogadfghafdpghapghadpgdafg');
        expect(data).toBeNull();
    });
});
