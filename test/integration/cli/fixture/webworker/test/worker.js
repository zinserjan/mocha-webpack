const assert = require('assert');
const MyWorker = require('worker-loader!../src/worker');

describe('worker', function () {

  beforeEach(function () {
    this.worker = new MyWorker();
  });

  it('adds', function () {
    return Promise
      .resolve()
      .then(() => {
        this.worker.postMessage([1, 1]);
        return new Promise(resolve => {
          this.worker.onmessage = (result) => {
            resolve(result.data);
          };
        });
      })
      .then((result) => assert.equal(result, 2));
  });

  afterEach(function () {
    this.worker.terminate();
  });
});
