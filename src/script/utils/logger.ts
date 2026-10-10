// Custom logger utility with a standardized prefix for easier filtering in YouTube console.
const PREFIX = '[Playlist-Plugin]';

export const logger = {
  log: (...args: any[]): void => {
    console.log(PREFIX, ...args);
  },
  error: (...args: any[]): void => {
    console.error(PREFIX, ...args);
  },
  warn: (...args: any[]): void => {
    console.warn(PREFIX, ...args);
  },
  info: (...args: any[]): void => {
    console.info(PREFIX, ...args);
  },
};
