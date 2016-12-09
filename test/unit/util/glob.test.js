/* eslint-env node, mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-loop-func, max-len */
import { assert } from 'chai';
import { ensureGlob, extensionsToGlob } from '../../../src/util/glob';

describe('glob', function () {
  context('ensureGlob', function () {
    it('allows to pass in file paths', function () {
      const path = 'test/file/test.js';
      const expected = path;

      const result = ensureGlob(path);
      assert.strictEqual(result, expected);
    });

    it('allows to pass in globs', function () {
      const path = 'test/file/**/*.test';
      const expected = path;

      const result = ensureGlob(path);
      assert.strictEqual(result, expected);
    });

    it('transforms directories to glob non-recursive', function () {
      const path = 'test/file/';
      const expected = 'test/file/*.js';

      const result = ensureGlob(path);
      assert.strictEqual(result, expected);
    });

    it('transforms directories to glob recursive', function () {
      const path = 'test/file/';
      const expected = 'test/file/**/*.js';

      const result = ensureGlob(path, true);
      assert.strictEqual(result, expected);
    });

    it('transforms directories to glob non-recursive with custom file pattern', function () {
      const path = 'test/file/';
      const expected = 'test/file/*.{js,coffee,ts}';

      const result = ensureGlob(path, false, '*.{js,coffee,ts}');
      assert.strictEqual(result, expected);
    });

    it('transforms directories to glob recursive with custom file pattern', function () {
      const path = 'test/file/';
      const expected = 'test/file/**/*.{js,coffee,ts}';

      const result = ensureGlob(path, true, '*.{js,coffee,ts}');
      assert.strictEqual(result, expected);
    });

    it('throws an error when transforming directory to glob and an invalid file pattern is given', function () {
      const path = 'test/file/';
      const errorNonGlob = /is not a valid glob pattern/;
      const errorNonFilePattern = /must be a file pattern like/;

      assert.doesNotThrow(() => ensureGlob(path, true, '*.js'));
      assert.doesNotThrow(() => ensureGlob(path, true, '*.{js,coffee,ts}'));
      assert.throws(() => ensureGlob(path, true, 'd'), errorNonGlob);
      assert.throws(() => ensureGlob(path, true, '**/*.js'), errorNonFilePattern);
      assert.throws(() => ensureGlob(path, true, 'test/*.js'), errorNonFilePattern);
      assert.doesNotThrow(() => ensureGlob(path, true, '*.js'));
    });
  });

  context('extensionsToGlob', function () {
    it('handles ["", ".js", ".coffee"]', function () {
      const given = ['', '.js', '.coffee'];
      const expected = '*{.js,.coffee}';
      const result = extensionsToGlob(given);
      assert.strictEqual(result, expected);
    });

    it('handles ["", ".js"]', function () {
      const given = ['', '.js'];
      const expected = '*.js';
      const result = extensionsToGlob(given);
      assert.strictEqual(result, expected);
    });

    it('handles [""] - js fallback', function () {
      const given = [''];
      const expected = '*.js';
      const result = extensionsToGlob(given);
      assert.strictEqual(result, expected);
    });

    it('handles [] - js fallback', function () {
      const given = [];
      const expected = '*.js';
      const result = extensionsToGlob(given);
      assert.strictEqual(result, expected);
    });
  });
});
