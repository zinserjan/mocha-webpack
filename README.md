# mocha-webpack [![npm package][npm-badge]][npm]  [![Build Status][build-badge]][build] [![codecov][codecov-badge]][codecov]

Precompiles your server-side webpack bundles before running mocha.  Inspired by [karma-webpack] alternatives usage, but this is for Node.js!

Looking for a test runner for the browser? Use [karma-webpack] instead.

## Project status
Work in progress...


## Why you might need or want this module
You're  building universal javascript applications with webpacks awesome features like including css or images and wanna test your code also in Node?

No problem! Just precompile your tests before running mocha:

```bash
$ webpack test.js output.js && mocha output.js
```

Seems pretty easy. But there are some disadvantages with this approach:
- you can no longer use mochas glob file matching
- you have to precompile each single test or maintain a test entry file and require the desired files

This project is a optimized version of this simple approach with following features:
- precompiles your test files automatically with webpack before executing tests
- no files are written to disk
- define tests to execute like mocha:
  - run a single test file
  - run all tests in the desired directory & if desired in all subdirectories
  - run all tests matching a glob pattern
- rerun only modified & dependent tests in watch mode on file change


## Installing mocha-webpack
The recommended approach is to install mocha-webpack locally in your project's directory.

```bash
# install mocha, webpack & mocha-webpack as devDependencies
$ npm install --save-dev mocha webpack mocha-webpack
```
This will install `mocha`, `webpack` and `mocha-webpack` packages into `node_modules` in your project directory and also save these as `devDependencies` in your package.json.

Congratulations, you are ready to run mocha-webpack for the first time in your project!

```bash
# display version of mocha-webpack
$ node ./node_modules/mocha-webpack/bin/mocha-webpack --version

# display available commands & options of mocha-webpack
$ node ./node_modules/mocha-webpack/bin/mocha-webpack --help
```

### Configuring mocha-webpack

Typing `node ./node_modules/mocha-webpack/bin/mocha-webpack ....` is just annoying and you might find it useful to configure your run commands as npm scripts inside your `package.json`.


**package.json**
```json
...
"scripts": {
    "test": "mocha-webpack --webpack-config webpack.config-test.js \"src/**/*.test.js\"",
  },
...
```

This allows you to run your test command simply by just typing `npm run test`.

In addition, the defined command tells mocha-webpack to use the provided webpack config file `webpack.config-test.js` and to execute all tests matching the pattern `src/**/*.test.js`.

**webpack.config-test.js** - example config
```javascript
var nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node', // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
};
```

Maybe you noticed that [entry](https://webpack.github.io/docs/configuration.html#entry), [output.filename](https://webpack.github.io/docs/configuration.html#output-filename) and [output.path](https://webpack.github.io/docs/configuration.html#output-path) are completely missing in this config. mocha-webpack does this automatically for you and if you would specify it anyway, it will be overridden by mocha-webpack.

If you want to use JavaScript preprocessor such as [Babel](https://babeljs.io/) or [CoffeeScript](http://coffeescript.org/)
in your webpack config file then give it a name ending with corresponding extension:

**webpack.config-test.babel.js** - Babel example config
```javascript
import nodeExternals from 'webpack-node-externals';

export default {
  target: 'node',
  externals: [nodeExternals()],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel-loader"
      }
    ]
  }
};
```

**webpack.config-test.coffee** - CoffeeScript example config
```coffee
nodeExternals = require 'webpack-node-externals'

module.exports =
  target: 'node'
  externals: [nodeExternals()]
  module:
    loaders: [
      {
        test: /\.coffee$/
        loader: "coffee-loader"
      }
    ]
```

### Shared configuration

mocha-webpack will attempt to load `mocha-webpack.opts` as a configuration file in your working directory. The lines in this file are combined with any command-line arguments. The command-line arguments take precedence. Imagine you have the following mocha-webpack.opts file:

**mocha-webpack.opts**
```
--colors
--webpack-config webpack.config-test.js
src/**/*.test.js
```

and call mocha-webpack with
```bash
$ mocha-webpack --growl
```

then it's equivalent to

```bash
$ mocha-webpack --growl --colors --webpack-config webpack.config-test.js "src/**/*.test.js"
```
### Sourcemaps

Sourcemap support is already applied for you via [source-map-support](https://github.com/evanw/node-source-map-support) by mocha-webpack. You just need to enable them in your webpack config via the `devtool` setting.

**Note**: For a proper debug experience in your IDE (setting breakpoints right into your code) you need to use a `devtool` which inlines the sourcemaps like `inline-source-map`.

**webpack.config-test.js**
```javascript
var nodeExternals = require('webpack-node-externals');

module.exports = {
  output: {
    // sourcemap support for IntelliJ/Webstorm
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  },
  target: 'node', // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  devtool: "inline-source-map"
};
```


## Sample commands

run a single test

```bash
mocha-webpack --webpack-config webpack.config-test.js simple.test.js
```

run all tests by glob

```bash
mocha-webpack --webpack-config webpack.config-test.js "test/**/*.js"
```

run all tests in directory "test" (add `--recursive` to include subdirectories)

```bash
mocha-webpack --webpack-config webpack.config-test.js test
```

run all tests in directory "test" matching the file pattern "\*.test.js"

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
[npm-badge]: https://img.shields.io/npm/v/mocha-webpack.svg?style=flat-square
[npm]: https://www.npmjs.org/package/mocha-webpack
[codecov-badge]:https://codecov.io/gh/zinserjan/mocha-webpack/branch/master/graph/badge.svg
[codecov]: https://codecov.io/gh/zinserjan/mocha-webpack
