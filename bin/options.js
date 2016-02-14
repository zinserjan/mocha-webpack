/* eslint-disable no-var,prefer-arrow-callback,prefer-template  */

var yargs = require('yargs');
var _ = require('lodash');

var BASIC_GROUP = 'Basic options:';
var OUTPUT_GROUP = 'Output options:';
var ADVANCED_GROUP = 'Advanced options:';

var reporterOptions = {};


var options = {
  'async-only': {
    alias: 'A',
    type: 'boolean',
    describe: 'force all tests to take a callback (async) or return a promise',
    group: ADVANCED_GROUP,
    default: false,
  },
  colors: {
    alias: 'c',
    type: 'boolean',
    describe: 'force enabling of colors',
    group: OUTPUT_GROUP,
    default: false,
  },
  growl: {
    alias: 'G',
    type: 'boolean',
    describe: 'enable growl notification support',
    group: OUTPUT_GROUP,
    default: false,
  },
  recursive: {
    type: 'boolean',
    describe: 'include sub directories',
    group: ADVANCED_GROUP,
    default: false,
  },
  'reporter-options': {
    alias: 'O',
    type: 'string',
    describe: 'reporter-specific options, --reporter-specific <k=v,k2=v2,...>',
    group: OUTPUT_GROUP,
    requiresArg: true,
  },
  reporter: {
    alias: 'R',
    type: 'string',
    describe: 'specify the reporter to use',
    group: OUTPUT_GROUP,
    default: 'spec',
    requiresArg: true,
  },
  bail: {
    alias: 'b',
    type: 'boolean',
    describe: 'bail after first test failure',
    group: ADVANCED_GROUP,
    default: false,
  },
  grep: {
    alias: 'g',
    type: 'string',
    describe: 'only run tests matching <pattern>',
    group: ADVANCED_GROUP,
    requiresArg: true,
  },
  fgrep: {
    alias: 'f',
    type: 'string',
    describe: 'only run tests containing <string>',
    group: ADVANCED_GROUP,
    requiresArg: true,
  },
  invert: {
    alias: 'i',
    type: 'boolean',
    describe: 'inverts --grep and --fgrep matches',
    group: ADVANCED_GROUP,
    default: false,
  },
  slow: {
    alias: 's',
    describe: '"slow" test threshold in milliseconds',
    group: ADVANCED_GROUP,
    default: 75,
    defaultDescription: '75 ms',
    requiresArg: true,
  },
  timeout: {
    alias: 't',
    describe: 'set test-case timeout in milliseconds',
    group: ADVANCED_GROUP,
    default: 2000,
    defaultDescription: '2000 ms',
    requiresArg: true,
  },
  ui: {
    alias: 'u',
    describe: 'specify user-interface',
    choices: ['bdd', 'tdd', 'exports', 'qunit'],
    group: BASIC_GROUP,
    default: 'bdd',
    requiresArg: true,
  },
  watch: {
    alias: 'w',
    type: 'boolean',
    describe: 'watch files for changes',
    group: BASIC_GROUP,
    default: false,
  },
  'webpack-config': {
    type: 'string',
    describe: 'path to webpack-config file',
    group: BASIC_GROUP,
    default: 'webpack.config.js',
    requiresArg: true,
  },
  'check-leaks': {
    type: 'boolean',
    describe: 'check for global variable leaks',
    group: ADVANCED_GROUP,
    default: false,
  },
  'full-trace': {
    type: 'boolean',
    describe: 'display the full stack trace',
    group: ADVANCED_GROUP,
    default: false,
  },
  'inline-diffs': {
    type: 'boolean',
    describe: 'display actual/expected differences inline within each string',
    group: ADVANCED_GROUP,
    default: false,
  },
  exit: {
    type: 'boolean',
    describe: 'require a clean shutdown of the event loop: mocha will not call process.exit',
    group: ADVANCED_GROUP,
    default: false,
  },
  retries: {
    describe: 'set numbers of time to retry a failed test case',
    group: BASIC_GROUP,
    requiresArg: true,
  },
  delay: {
    type: 'boolean',
    describe: 'wait for async suite definition',
    group: ADVANCED_GROUP,
    default: false,
  },
};


var argv = yargs
  .help('help')
  .alias('help', 'h', '?')
  .version(function getVersion() {
    return require('../package').version;
  })
  .options(options)
  .strict()
  .argv;


var files = argv._ || [];

var parameters = _.map(_.keys(options), _.camelCase); // camel case parameters

var parsedOptions = _.pick(argv, parameters); // pick all parameters as new object from options
var validOptions = _.omitBy(parsedOptions, _.isUndefined); // remove all undefined values
validOptions.files = files;

if (validOptions.reporterOptions) {
  validOptions.reporterOptions.split(',').forEach(function parsedReporterOptions(opt) {
    var L = opt.split('=');
    if (L.length > 2 || L.length === 0) {
      throw new Error('invalid reporter option "' + opt + '"');
    } else if (L.length === 2) {
      reporterOptions[L[0]] = L[1];
    } else {
      reporterOptions[L[0]] = true;
    }
  });
}

validOptions.reporterOptions = reporterOptions;

module.exports = validOptions;
