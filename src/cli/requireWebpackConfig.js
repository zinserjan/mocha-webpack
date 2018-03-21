import path from 'path';
import fs from 'fs';
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

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (e) {
    return false;
  }
}

function findConfigFile(dirPath, baseName) {
  for (let i = 0; i < extensions.length; i += 1) {
    const filePath = path.resolve(dirPath, `${baseName}${extensions[i]}`);
    if (fileExists(filePath)) {
      return filePath;
    }
  }
  return null;
}

function getConfigExtension(configPath) {
  for (let i = extensions.length - 1; i >= 0; i -= 1) {
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
    require(moduleDescriptor); // eslint-disable-line global-require, import/no-dynamic-require
  } else if (!Array.isArray(moduleDescriptor)) {
    const module = require(moduleDescriptor.module); // eslint-disable-line global-require, import/no-dynamic-require
    moduleDescriptor.register(module);
  } else {
    for (let i = 0; i < moduleDescriptor.length; i += 1) {
      try {
        registerCompiler(moduleDescriptor[i]);
        break;
      } catch (e) {
        // do nothing
      }
    }
  }
}

export default function requireWebpackConfig(webpackConfig, required, env, mode) {
  const configPath = path.resolve(webpackConfig);
  const configExtension = getConfigExtension(configPath);
  let configFound = false;
  let config = {};

  if (fileExists(configPath)) {
    // config exists, register compiler for non-js extensions
    registerCompiler(interpret.extensions[configExtension]);
    // require config
    config = require(configPath); // eslint-disable-line global-require, import/no-dynamic-require
    configFound = true;
  } else if (configExtension === '.js') {
    // config path does not exist, try to require it with precompiler
    const configDirPath = path.dirname(configPath);
    const configBaseName = path.basename(configPath, configExtension);
    const configPathPrecompiled = findConfigFile(configDirPath, configBaseName);
    if (configPathPrecompiled != null) {
      // found a config that needs to be precompiled
      const configExtensionPrecompiled = getConfigExtension(configPathPrecompiled);
      // register compiler & require config
      registerCompiler(interpret.extensions[configExtensionPrecompiled]);
      config = require(configPathPrecompiled); // eslint-disable-line global-require, import/no-dynamic-require
      configFound = true;
    }
  }

  if (!configFound) {
    if (required) {
      throw new Error(`Webpack config could not be found: ${webpackConfig}`);
    } else if (mode != null) {
      config.mode = mode;
    }
    return config;
  }

  config = config.default || config;

  if (typeof config === 'function') {
    config = config(env);
  }

  if (mode != null) {
    config.mode = mode;
  }

  if (Array.isArray(config)) {
    throw new Error('Passing multiple configs as an Array is not supported. Please provide a single config instead.');
  }

  return config;
}
