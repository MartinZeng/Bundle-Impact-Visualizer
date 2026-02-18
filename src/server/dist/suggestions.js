export const ALTERNATIVES = {
    moment: {
        replacement: 'dayjs or datefns',
        reason: 'Moment.js is large and lacks tree-shaking support',
    },
    lodash: {
        replacement: 'lodash-es',
        reason: 'Standard lodash is CommonJS and hard to tree-shake. lodash-es is the ESM version',
    },
    axios: {
        replacement: 'native fetch',
        reason: 'Axios adds ~11KB gzipped, Native fetch is built into modern browsers and Node18+',
    },
    request: {
        replacement: 'got',
        reason: 'The request package is deprecated and very heavy',
    },
    classnames: {
        replacement: 'clsx',
        reason: 'clsx is smaller (228B) and faster',
    },
};
