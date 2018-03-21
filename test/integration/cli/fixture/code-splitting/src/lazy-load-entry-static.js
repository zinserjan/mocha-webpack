/* eslint-disable */


module.exports = function (cb) {
  require.ensure([], function (require) {
    var entry1 = require('./entry/entry1');
    var entry2 = require('./entry/entry2');
    cb();
  });
};
