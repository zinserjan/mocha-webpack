var del = require('del');

del(['lib/**', '!lib', '!lib/reporters', '!lib/utils.js', '!lib/reporters/base.js']).then(paths => {
  console.log('Deleted files and folders:\n', paths.join('\n'));
});
