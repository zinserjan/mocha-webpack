/*eslint-disable */

var assert = require('chai').assert;

if (typeof assert.testInclude !== 'function') {
  throw new Error('test-helper must be executed before!');
}

console.log('second --include works');
