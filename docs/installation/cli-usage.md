# CLI Usage


```bash
Usage: mocha-webpack [options] [<file|directory|glob> ...]

Options

  --async-only, -A               force all tests to take a callback (async) or return a promise
  --colors, -c                   force enabling of colors
  --interactive                  force interactive mode
  --quiet, -q                    does not display informational messages
  --growl, -G                    enable growl notification support
  --recursive                    include sub directories
  --reporter, -R                 specify the reporter to use
  --reporter-options, -O         reporter-specific options, --reporter-options <k=v,k2=v2,...>
  --bail, -b                     bail after first test failure
  --glob                         only test files matching <pattern> (only valid for directory entry)
  --grep, -g                     only run tests matching <pattern>
  --fgrep, -f                    only run tests containing <string>
  --invert, -i                   inverts --grep and --fgrep matches
  --require, -r                  require the given module
  --include                      include the given module into test bundle
  --slow, -s                     "slow" test threshold in milliseconds
  --timeout, -t                  set test-case timeout in milliseconds
  --ui, -u                       specify user-interface
  --watch, -w                    watch files for changes
  --check-leaks                  check for global variable leaks
  --full-trace                   display the full stack trace
  --inline                       display actual/expected differences inline within each string
  --exit                         require a clean shutdown of the event loop: mocha will not call process
  --retries                      set numbers of time to retry a failed test case
  --delay                        wait for async suite definition
  --webpack-config               path to webpack-config file
  --webpack-env                  environment passed to the webpack-config, when it is a function
  --opts                         path to webpack-mocha options file, Default cwd/mocha-webpack.opts

Examples

  mocha-webpack "src/**/*.test.js"
  mocha-webpack --webpack-config webpack.config-test.js

Default pattern when no arguments:
  "test/*.{ext}"              {ext} is placeholder for extensions in your webpack config via 'resolve.extensions'. Fallbacks to '.js'

```


## Most useful options

### --webpack-config

Allows you to use your own webpack configuration to define custom loaders and other webpack related stuff. 

When the parameter `--webpack-config` is omitted, mocha-webpack tries to load a webpack-config file named `webpack.config.js`, but will not bail when it doesn't exist.
It fails only for missing webpack config files when the config is explicitly given.


If you need to use a JavaScript preprocessor such as [Babel](https://babeljs.io/) or [CoffeeScript](http://coffeescript.org/)
for your webpack config file then give it a name that ends with corresponding extension and call it without it:

`$ mocha-webpack --webpack-config webpack.config-test.js`

**webpack.config-test.babel.js** - Babel example config
```javascript
export default {
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader"
      }
    ]
  }
};
```

**webpack.config-test.coffee** - CoffeeScript example config
```coffeescript
module.exports =
  module:
    rules: [
      {
        test: /\.coffee$/
        loader: "coffee-loader"
      }
    ]
```

Instead of returning a webpack config, you can also export a function which returns the config when called. You should use this in conjunction with the `--webpack-env` option to make your config environment aware, for example `--webpack-env test`.

```javascript
export default function (env) {
  return {
    devtool: env === "production" ? "source-map": "inline-cheap-module-source-map",
    target: env === "test" ? "node" : "web",
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: "babel-loader"
        }
      ]
    }
  }
};
```

Please have a look at the [webpack configuration chapter](./webpack-configuration.md) to get further instructions & tips.

### --opts

mocha-webpack attempts to load a configuration file named `mocha-webpack.opts` in your working directory. It's basically the same like `mocha.opts` for mocha and appends common CLI options automatically to your commands.

`--opts` allows you to define a custom file path for this config file.

The lines in this file are combined with any command-line arguments. Command-line arguments take precedence.

Imagine you have the following mocha-webpack.opts file:

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

### --glob, --recursive

When you use a directory as a test entry `--glob` and `--recursive` can help you to control the files to test.

- `--glob` affects only directory entries and allows you to specifiy a pattern (e.g. `*.test.js`) for the files that should be tested
- `--recursive` searches also in subdirectories for tests to run


### --require, --include

`--require` is a known mocha option that lets you execute files before your tests will be required.
It's useful for setup stuff like initializing `jsdom`.

`--include` does something similar, except that the files will be included into the webpack bundle.
But like `--require` they will be executed before your tests.


### --watch

Starts mocha-webpack in watch mode and compiles & run your tests automatically when a file change occur.
Unlike mocha, mocha-webpack analyzes your dependency graph and run only those test files that were affected by this file change.

