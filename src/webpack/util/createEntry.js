// @flow

export default function createEntry(filePaths: Array<string>): string {
  return [
    '// runtime helper',
    'function inManifest(id) { return global.__webpackManifest__.indexOf(id) >= 0;}',
    'function run(id) { __webpack_require__(id);}',
    '',
    '// modules to execute goes here',
    'var ids = [',
    filePaths.map((path) => `require.resolve(${path})`).join(','),
    '];',
    '',
    'ids.filter(inManifest).forEach(run)',
  ].join('\n');
}
