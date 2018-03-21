import chalk from 'chalk';
import ProgressBar from 'progress';
import { ProgressPlugin } from 'webpack';

export default function buildProgressPlugin() {
  const bar = new ProgressBar(`  [:bar] ${chalk.bold(':percent')} (${chalk.dim(':msg')})`, {
    total: 100,
    complete: '=',
    incomplete: ' ',
    width: 25,
  });
  return new ProgressPlugin((percent, msg) => {
    bar.update(percent, {
      msg: percent === 1 ? 'completed' : msg,
    });
    if (percent === 1) {
      bar.terminate();
    }
  });
}
