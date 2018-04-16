# Using mocha-webpack with jsdom

[jsdom](https://github.com/tmpvar/jsdom) is a JavaScript based headless browser that can be used to create a realistic testing environment.

For the best experience with jsdom, it is recommended that you load a document into the global
scope *before* running everything else. This can be done in four simple steps.

First of all you need to install jsdom (*Note:* This guide uses jsdom in version 9.9.1.)

```bash
$ npm install jsdom --save-dev
```

Then create a helper script to prepare the jsdom environment, e.g. `setup.js`.

**setup.js**
```js
import jsdom from "jsdom";

const { JSDOM } = jsdom;
const dom = new JSDOM("");

Object.assign(global, {
  document: dom.window.document,
  window: dom.window,
  navigator: {
    userAgent: `node.js`
  }
});

window.console = global.console;

Object.getOwnPropertyNames(window)
  .forEach(property => {
    if (typeof global[property] === `undefined`) {
      global[property] = window[property];
    }
  });
```

As next you need to make sure that the compile `target` in your Webpack configuration is `node`.
This makes sure that Node can interpret Webpack's code properly and that you have access to node features like `fs`, `global`, `process`, etc.

**webpack-config.test.js**
```js
var nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node', // webpack should emit node.js compatible code
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder from bundling
};
```

And finally use it with the command line using the `--require` and `--webpack-config` option:

```bash
$ mocha-webpack --require setup.js --webpack-config webpack-config.test.js
```

## Node.js Compatibility

jsdom requires Node 4 or above. If you are stuck using an older version of Node, you
may want to try using a browser-based test runner such as [Karma Webpack](https://github.com/webpack/karma-webpack).
