// @flow

export default function createEntry(filePaths: Array<string>): string {
  return [
    '// runtime helper',
    'function inManifest(id) { return __webpackManifest__.indexOf(id) >= 0;}',
    'function run(id) { __webpack_require__(id);}',
    '',
    '',
    // '// include the following modules into the bundle, but do not evaluate them yet',
    // filePaths.map((path) => `require.include(${path});`).join('\n'),
    '',
    '',
    '// modules to execute goes here',
    'var ids = [',
    filePaths.map((path) => `require.resolve(${path})`).join(','),
    '];',
    // '// This gets replaced by webpack with the updated files on rebuild',
    // 'var __webpackManifest__ = [];',
    '',
    '',
    'ids.filter(inManifest).forEach(run)',
  ].join('\n');
}
