module.exports = function reporter(runner) {
  runner.on('start', () => {
    console.log('customMochaReporter started'); // eslint-disable-line
  });

  runner.on('end', () => {
    console.log('customMochaReporter finished'); // eslint-disable-line
  });
};
