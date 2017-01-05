/* eslint-disable */

var assert = require('assert');
var loadCyclic = require('../src/cyclic');

describe('cyclic-load-dependency', function () {
  it('runs test', function (cb) {
    loadCyclic('entry1', cb);
  });
});
