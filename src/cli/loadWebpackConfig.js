import path from 'path';
import interpret from 'interpret';

function sortExtensions(ext1, ext2) {
  if (ext1 === '.js') {
    return -1;
  }
  if (ext2 === '.js') {
    return 1;
  }
  return ext1.length - ext2.length;
}

const extensions = Object.keys(interpret.extensions).sort(sortExtensions);

function getConfigExtension(configPath) {
  for (let i = extensions.length - 1; i >= 0; i--) {
    const extension = extensions[i];
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

  if (typeof moduleDescriptor === 'string') {
    require(moduleDescriptor); // eslint-disable-line global-require
  } else if (!Array.isArray(moduleDescriptor)) {
    const module = require(moduleDescriptor.module); // eslint-disable-line global-require
    moduleDescriptor.register(module);
  } else {
    for (let i = 0; i < moduleDescriptor.length; i++) {
      try {
        registerCompiler(moduleDescriptor[i]);
        break;
      } catch (e) {
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
  const config = require(webpackConfigPath); // eslint-disable-line global-require

  return config.default || config;
}
