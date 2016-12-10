// @flow
import webpack from 'webpack';
import registerSourcemapSupport from '../util/registerSourcemapSupport';
import type { Compiler } from '../types';

export default function createCompiler(webpackConfig: {}, cb: (err: ?{}) => void): Compiler {
  const compiler = webpack(webpackConfig);

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
    if (stats.hasErrors()) {
      const jsonStats = stats.toJson();
      const [err] = jsonStats.errors;
      cb(err);
    // } else if (failedModulesErrors.length) {
    //   const [err] = failedModulesErrors;
    //   cb(err);
    } else {
      cb();
    }
  });

  registerSourcemapSupport(compiler);

  return compiler;
}
