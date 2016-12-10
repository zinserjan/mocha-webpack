import sourceMapSupport from 'source-map-support';

export default function registerSourcemapSupport() {
  sourceMapSupport.install({
    emptyCacheBetweenOperations: true,
    handleUncaughtExceptions: false,
    environment: 'node',
  });
}
