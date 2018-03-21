/* eslint-disable */


module.exports = function (cb) {
  require.ensure([], function () {
    cb();
  });
};
