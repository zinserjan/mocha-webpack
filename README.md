# mocha-webpack

Precompiles your server-side webpack bundles before running mocha.  Inspired by [karma-webpack] alternatives usage, but this is for NodeJS!

Looking for a test runner for the browser? Use [karma-webpack] instead.

## Status

Work in progress...


### Features
- easy testing of webpack code in node with mocha
- reruns modified tests on file change

### Usage
```
mocha-webpack --webpack-config webpack.config-test.js --watch --colors test_index.js
```

```js

// webpack.config-test.js
var nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node', // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  devtool: "#source-map"
};
```

```js

// test_index.js

// This gets replaced by webpack with the updated files on rebuild
var __webpackManifest__ = [];

// require all modules ending in ".test" from the
// src directory and all subdirectories
var testsContext = require.context("./src", true, /\.test$/);

function inManifest(path) {
  return __webpackManifest__.indexOf(path) >= 0;
}

var runnable = testsContext.keys().filter(inManifest);

// // Run all tests if we didn't find any changes
if (!runnable.length) {
  runnable = testsContext.keys();
}

runnable.forEach(testsContext);

```

### CLI options

TODO


##

[karma-webpack]: https://github.com/webpack/karma-webpack
