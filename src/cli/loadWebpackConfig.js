import path from 'path';
import interpret from 'interpret';

const extensions = Object.keys(interpret.extensions).sort(function(a, b) {
  return a === '.js' ? -1 : b === '.js' ? 1 : a.length - b.length;
});

function getConfigExtension(configPath) {
  for (let i = extensions.length - 1; i >= 0; i--) {
    let extension = extensions[i];
    if (configPath.indexOf(extension, configPath.length - extension.length) > -1) {
      return extension;
    }
  }
  return path.extname(configPath);
}

function registerCompiler(moduleDescriptor) {
  if (!moduleDescriptor) {
    return;
  }

  if (typeof moduleDescriptor === "string") {
    require(moduleDescriptor);
  } else if (!Array.isArray(moduleDescriptor)) {
    moduleDescriptor.register(require(moduleDescriptor.module));
  } else {
    for (let i = 0; i < moduleDescriptor.length; i++) {
      try {
        registerCompiler(moduleDescriptor[i]);
        break;
      } catch(e) {
        // do nothing
      }
    }
  }
}

export default function loadWebpackConfig(webpackConfig) {
  if (!webpackConfig) {
    return {};
  }

  const webpackConfigPath = path.resolve(webpackConfig);
  const webpackConfigExtension = getConfigExtension(webpackConfigPath);

  registerCompiler(interpret.extensions[webpackConfigExtension]);
  webpackConfig = require(webpackConfigPath);

  return webpackConfig.default || webpackConfig;
}