# mocha-webpack [![Build Status][build-badge]][build] [![npm package][npm-badge]][npm]

Precompiles your server-side webpack bundles before running mocha.  Inspired by [karma-webpack] alternatives usage, but this is for NodeJS!

Looking for a test runner for the browser? Use [karma-webpack] instead.

## Status

Work in progress...


### Features
- easy testing of webpack code in node with mocha
- reruns modified tests on file change

### Usage


run a single test
```
mocha-webpack --webpack-config webpack.config-test.js --colors "test_index.js"
```

run all tests by glob
```
mocha-webpack --webpack-config webpack.config-test.js --colors "test/**/*.js"
```

run all tests in directory (add `--recursive` to include subdirectories)
```
mocha-webpack --webpack-config webpack.config-test.js --colors "test"
```

Watch mode? just add `--watch`
```
mocha-webpack --webpack-config webpack.config-test.js --watch --colors "test"
```

### CLI options

TODO


##

[karma-webpack]: https://github.com/webpack/karma-webpack

[build-badge]: https://travis-ci.org/zinserjan/mocha-webpack.svg?branch=master
[build]: https://travis-ci.org/zinserjan/mocha-webpack

[npm-badge]: https://img.shields.io/npm/v/mocha-webpack.svg?style=flat-square
[npm]: https://www.npmjs.org/package/mocha-webpack
