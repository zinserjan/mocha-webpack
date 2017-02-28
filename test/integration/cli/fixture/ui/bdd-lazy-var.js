/* eslint-disable */
var assert = require('assert');


describe('simple test', function() {
  subject(function() {
    return 'Test';
  });

  it('it works', function() {
    assert.strictEqual(get.subject, 'Test');
  });
});
