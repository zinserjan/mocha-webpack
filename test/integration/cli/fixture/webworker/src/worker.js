/* eslint-disable */

self.addEventListener("message", (event) => {
  self.postMessage(event.data[0] + event.data[1]);
});
