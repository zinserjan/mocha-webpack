# Installation

The recommended approach to setup mocha-webpack is to install it locally in your project's directory.

```bash
# install mocha, webpack & mocha-webpack as devDependencies
$ npm install --save-dev mocha webpack mocha-webpack
```
This will install `mocha`, `webpack` and `mocha-webpack` packages in your project directory into `node_modules` and also store them as `devDependencies` in your package.json.

Congratulations, you are ready to run mocha-webpack for the first time in your project!

```bash
# display version of mocha-webpack
$ node ./node_modules/mocha-webpack/bin/mocha-webpack --version

# display available commands & options of mocha-webpack
$ node ./node_modules/mocha-webpack/bin/mocha-webpack --help
```

### Using npm scripts

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

In addition, the defined command tells mocha-webpack to use the provided webpack config file `webpack.config-test.js` and to execute all tests matching the pattern `"src/**/*.test.js"`.

**Note:** You may noticed the quotes around the glob pattern. That's unfortunately necessary as most terminals will resolve globs automatically.

For more installation details please have a look at the subchapter of the installation section.
