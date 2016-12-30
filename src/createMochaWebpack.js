// @flow
import MochaWebpack from './MochaWebpack';

// module.exports cause of babel 6
module.exports = function createMochaWebpack(): MochaWebpack {
  return new MochaWebpack();
};
