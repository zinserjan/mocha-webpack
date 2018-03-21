/* eslint-disable */

var assert = require('assert');
var lazyLoadEntry = require('../src/lazy-load-entry-dynamic');

describe('lazy-load-entry-dynamic', function () {
  it('runs test', function (cb) {
    lazyLoadEntry('entry1', cb);
  });
});
