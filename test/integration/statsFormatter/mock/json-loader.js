/**
 * Mock JSON Loader that throws just 'Unexpected token' with a strack trace.
 *
 * The original json-loader uses native JSON.parse which throws inconsistent errors in different node versions.
 */
module.exports = function () {
  throw new SyntaxError('Unexpected token');
};
