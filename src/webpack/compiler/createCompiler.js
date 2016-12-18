// @flow
import webpack from 'webpack';
import type { Compiler } from '../types';
import type { OutputChunks } from '../util/getOutputChunks';
import getOutputChunks from '../util/getOutputChunks';

type Config = {
  output: {
    path: string,
    filename: string,
  }
};

export default function createCompiler(webpackConfig: Config, cb: (err: ?{}, output: OutputChunks) => void): Compiler {
  const compiler = webpack(webpackConfig);
  const outputPath = webpackConfig.output.path;

  // const failedModules = [];
  // const failedModulesErrors = [];

  compiler.plugin('failed', cb);

  // compiler.plugin('compilation', (compilation) => {
  //   // Workaround to tag build as failed when webpack marks a failed module as just a warning
  //   compilation.plugin('build-module', (module) => {
  //     const ident = module.identifier();
  //
  //     if (ident) {
  //       const idx = failedModules.indexOf(ident);
  //       if (idx !== -1) {
  //         failedModules.splice(idx, 1);
  //         failedModulesErrors.splice(idx, 1);
  //       }
  //     }
  //   });
  //   compilation.plugin('failed-module', (module) => {
  //     const ident = module.identifier();
  //     if (ident) {
  //       failedModules.push(ident);
  //       failedModulesErrors.push(module.error);
  //     }
  //   });
  // });

  compiler.plugin('done', (stats) => {
    const jsonStats = stats.toJson();
    if (stats.hasErrors()) {
      const [err] = jsonStats.errors;
      cb(err, null);
    // } else if (failedModulesErrors.length) {
    //   const [err] = failedModulesErrors;
    //   cb(err);
    } else {
      const outputChunks: OutputChunks = getOutputChunks(jsonStats, outputPath);
      cb(null, outputChunks);
    }
  });

  return compiler;
}
