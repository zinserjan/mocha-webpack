/* eslint-disable */

module.exports = function (name, cb) {
    require.ensure([], function (require) {
        require('./' + name);
        cb();
    });
};
