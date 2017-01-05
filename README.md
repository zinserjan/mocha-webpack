# mocha-webpack [![npm package][npm-badge]][npm]  [![Build Status Linux][build-badge]][build] [![Build Status Windows][build-badge-windows]][build-windows] [![codecov][codecov-badge]][codecov]

> mocha test runner with integrated webpack precompiler

mocha-webpack is basically a wrapper around the following command...
```bash
$ webpack test.js output.js && mocha output.js
```

... but in a much more *powerful* & *optimized* way.

**TODO IMAGE HERE!!**

mocha-webpack ...
- precompiles your test files automatically with webpack before executing tests
- handles source-maps automatically for you
- does not write any files to disk
- understands globs & all other stuff as test entries like mocha

Benefits over plain mocha
- has nearly the same CLI as mocha (switchover is damn simple)
- you can identify issues in your webpack build early with your tests
- you don't rely on hacky solutions to get all benefits from webpack
- mocha-webpack provides a much better watch mode than mocha

## Watch mode (`--watch`)

Watch mode listens to changes in your files and test only the files that changed.

Unlike mocha, mocha-webpack analyzes your dependency graph and run only those test files that were affected by this change.
This allows you to write your tests first and code happily until all tests are green.

You'll get continues feedback when you make changes as all tests that are related in any way to this change will be tested again. Isn't that awesome?

## Installation


Installation and configuration instructions can be found here..

**TODO Link to instructions + beta note here!!**


## Sample commands

run a single test

```bash
mocha-webpack --webpack-config webpack.config-test.js simple.test.js
```

run all tests by glob

```bash
mocha-webpack --webpack-config webpack.config-test.js test/**/*.js
```

run all tests in directory "test" (add `--recursive` to include subdirectories)

```bash
mocha-webpack --webpack-config webpack.config-test.js test
```

run all tests in directory "test" matching the file pattern *.test.js

```bash
mocha-webpack --webpack-config webpack.config-test.js --glob "*.test.js" test
```

Watch mode? just add `--watch`

```
mocha-webpack --webpack-config webpack.config-test.js --watch test
```


### CLI options

see `mocha-webpack --help`

### License

MIT

[source-map-support]: https://github.com/evanw/node-source-map-support
[karma-webpack]: https://github.com/webpack/karma-webpack
[build-badge]: https://travis-ci.org/zinserjan/mocha-webpack.svg?branch=master
[build]: https://travis-ci.org/zinserjan/mocha-webpack
[build-badge-windows]: https://ci.appveyor.com/api/projects/status/pnik85hfqesxy7y9/branch/master?svg=true
[build-windows]: https://ci.appveyor.com/project/zinserjan/mocha-webpack
[npm-badge]: https://img.shields.io/npm/v/mocha-webpack.svg?style=flat-square
[npm]: https://www.npmjs.org/package/mocha-webpack
[codecov-badge]:https://codecov.io/gh/zinserjan/mocha-webpack/branch/master/graph/badge.svg
[codecov]: https://codecov.io/gh/zinserjan/mocha-webpack
