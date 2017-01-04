// @flow
import chalk from 'chalk';
import _ from 'lodash';

export const SUCCESS: string = 'success';
export const WARNING: string = 'warning';
export const ERROR: string = 'error';
export const INFO: string = 'info';
export const NOTE: string = 'note';

const getTextColor = (severity): string => {
  switch (severity.toLowerCase()) {
    case SUCCESS:
      return 'green';
    case WARNING:
      return 'yellow';
    case ERROR:
      return 'red';
    case INFO:
      return 'blue';
    case NOTE:
      return 'white';
    default:
      return 'red';
  }
};

const getBgColor = (severity: string): string => {
  const color: string = getTextColor(severity);
  return `bg${_.startCase(color)}`;
};

export const formatTitle = (severity: string, title: string): string => chalk[getBgColor(severity)]
  .black('', title, '');
export const formatMessage = (severity: string, message: string): string => chalk[getTextColor(severity)](message);
