import _ from 'lodash';
import path from 'path';
import normalizePath from 'normalize-path';
import fs from 'fs-extra';
import isGlob from 'is-glob';
import globParent from 'glob-parent';
import hash from 'object-hash';
import anymatch from 'anymatch';

import { existsFileSync, existsDirSync } from '../util/exists';
import createContextReplacementPlugin from '../webpack/contextReplacementPlugin';
import prepareEntry from '../webpack/prepareEntry';

const tmpPath = path.join(process.cwd(), '.tmp');

const extensions = ['js'];

function directoryToGlob(directory, options) {
  const { recursive } = options;
  const normalizedPath = normalizePath(directory);
  const star = recursive ? '**/*' : '*';
  const pattern = `${normalizedPath}/${star}.(${extensions.join('|')})`;
  return pattern;
}


function createWebpackConfig(webpackConfig, entryFilePath, outputFilePath, plugins = []) {
  const entryFileName = path.basename(entryFilePath);
  const entryPath = path.dirname(entryFilePath);

  const outputFileName = path.basename(outputFilePath);
  const outputPath = path.dirname(outputFilePath);

  const config = _.clone(webpackConfig);
  config.entry = `./${entryFileName}`;
  config.context = entryPath;
  config.output = _.extend({}, config.output, {
    filename: outputFileName,
    path: outputPath,
  });

  config.plugins = (config.plugins || []).concat(plugins);
  return config;
}


export default function prepareWebpack(options, cb) {
  const [file] = options.files;
  const glob = isGlob(file);

  if (glob || existsDirSync(file)) {
    const globPattern = glob ? file : directoryToGlob(file, options);

    const matcher = anymatch(globPattern);
    const parent = globParent(globPattern);
    const directory = path.resolve(parent);

    const context = path.relative(tmpPath, directory);
    const recursive = globPattern.indexOf('**') !== -1; // or via options.recursive?

    const optionsHash = hash.MD5(options); // eslint-disable-line new-cap

    const entryFilePath = path.join(tmpPath, `${optionsHash}-entry.js`);
    const outputFilePath = path.join(tmpPath, optionsHash, `${optionsHash}-output.js`);

    function matchModule(mod) { // eslint-disable-line no-inner-declarations
      // normalize path to match glob
      const correctedPath = path.join(parent, mod);
      return matcher(correctedPath);
    }

    const webpackPlugins = [createContextReplacementPlugin(context, matchModule, recursive)];

    const webpackConfig = createWebpackConfig(
      options.webpackConfig,
      entryFilePath,
      outputFilePath,
      webpackPlugins
    );

    const fileContent = prepareEntry(context, options.watch);

    if (!existsFileSync(entryFilePath)) {
      fs.outputFile(entryFilePath, fileContent, (err) => {
        cb(err, webpackConfig);
      });
    } else {
      process.nextTick(() => {
        cb(null, webpackConfig);
      });
    }
  } else if (existsFileSync(file)) {
    const entryFilePath = path.resolve(file);
    const outputFilePath = path.join(tmpPath, path.basename(entryFilePath));
    const webpackConfig = createWebpackConfig(options.webpackConfig, entryFilePath, outputFilePath);
    process.nextTick(() => {
      cb(null, webpackConfig);
    });
  } else {
    cb(new Error(`File/Directory not found: ${file}`));
  }
}
