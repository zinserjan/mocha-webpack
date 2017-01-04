// @flow
import { INFO, NOTE, SUCCESS, WARNING, ERROR, formatMessage as ftMsg, formatTitle as ftTitle } from './formatText';

export const log = (...args: Array<any>) => {
  console.log(...args); // eslint-disable-line no-console
  console.log(); // eslint-disable-line no-console
};
export const info = (message: string) => log(ftTitle(INFO, 'I'), message);
export const note = (message: string) => log(ftTitle(NOTE, 'N'), message);
export const success = (title: string, message: string) => log(ftTitle(SUCCESS, title), ftMsg(SUCCESS, message));
export const warn = (title: string, message: string) => log(ftTitle(WARNING, title), ftMsg(WARNING, message));
export const error = (title: string, message: string) => log(ftTitle(ERROR, title), ftMsg(ERROR, message));
// found the way to clear in https://github.com/facebookincubator/create-react-app/pull/1211
export const clear = () => process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H');

