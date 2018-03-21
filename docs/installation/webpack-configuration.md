# Webpack configuration

A really basic webpack configuration for mocha-webpack should at least contain the following:


**webpack.config-test.js** - example config
```javascript
var nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node', // webpack should compile node compatible code
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
};
```

The most important option is the value of `target`, as it tells webpack to compile the code for Node.js. When you leave this empty, webpack compiles for web environment and features like code-splitting will not work.

Another important thing is to *stop webpack from bundling your libraries* inside your node_modules folder.
This can be easily done by using the [webpack-node-externals](https://github.com/liady/webpack-node-externals) plugin.
The reason for this is that webpack isn't able to compile all node_modules like server only modules. Another reason is simply performance.

*Info*: You can install this plugin with `npm install --save-dev webpack-node-externals`

Maybe you noticed that [entry](https://webpack.github.io/docs/configuration.html#entry) and [output.path](https://webpack.github.io/docs/configuration.html#output-path) are completely missing in this config.
mocha-webpack does this automatically for you, but it respects custom `output` settings. This is especially useful, when you want to write the files to disk with an additional plugin.


## Sourcemaps

Sourcemap support is already applied for you via [source-map-support](https://github.com/evanw/node-source-map-support) by mocha-webpack.
You just need to enable it in your webpack config via the `devtool` setting.

**Note**: For a proper debug experience in your IDE (setting breakpoints right into your code) you need to use a `devtool` which inlines the sourcemaps like `inline-cheap-module-source-map`.

So your webpack-config should look like

**webpack.config-test.js**
```javascript
var nodeExternals = require('webpack-node-externals');

module.exports = {
  output: {
    // use absolute paths in sourcemaps (important for debugging via IDE)
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  },
  target: 'node',  // webpack should compile node compatible code
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  devtool: "inline-cheap-module-source-map"
};
```



## CSS Preprocessors

When you are using CSS Preprocessors like *less*, *sass*, or *post-css* then you need to think about:

- if you use CSS-Modules
- or not

When you never heard about [CSS-Modules](https://github.com/css-modules/css-modules) you probably don't use it.


### Without CSS-Modules
If you don't want to use CSS-Modules then you can replace all of your CSS loaders with [null-loader](https://github.com/webpack/null-loader):

Your webpack-config for the browser might look like the following:
```javascript
module.exports = {
    module: {
        rules: [
            // ...
            { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            // ...
        ]
    },
};
```

Replacing all CSS related loaders with [null-loader](https://github.com/webpack/null-loader) results in the following config:

```javascript
module.exports = {
    module: {
        rules: [
            // ...
            { test: /\.scss$/, loader: 'null-loader' },
            { test: /\.css$/, loader: 'null-loader' },
            // ...
        ]
    },
};
```

This has the following advantages:
  - you will no longer get the following error: `ReferenceError: window is not defined`
  - you don't have to compile your css to run your tests --> much faster


### With CSS-Modules

If you want to use CSS-Modules you have to make your loader definition compatible with the node environment.
It's the same setup like for universal applications respectively pre-rendering of Single Page Applications.

Your webpack-config for the browser might look like the following:
```javascript
module.exports = {
    module: {
        rules: [
            // ...
            { test: /\.scss$/, use: ['style-loader', 'css-loader?modules', 'sass-loader'] },
            { test: /\.css$/, use: ['style-loader', 'css-loader?modules'] },
            // ...
        ]
    },
};
```

To make the config compatible with the node environment you have to do two things:
- remove `style-loader`
- replace `css-loader` with `css-loader/locals`

Then your config looks like this and you're ready to test:
```javascript
module.exports = {
    module: {
        rules: [
            // ...
            { test: /\.scss$/, use: ['css-loader/locals?modules', 'sass-loader'] },
            { test: /\.css$/, use: ['css-loader/locals?modules'] },
            // ...
        ]
    },
};
```
