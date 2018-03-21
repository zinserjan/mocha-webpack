/* eslint-disable */


module.exports = function (name, cb) {
  require.ensure([], function (require) {
    var entry1 = require('./entry/' + name);
    cb();
  });
};
