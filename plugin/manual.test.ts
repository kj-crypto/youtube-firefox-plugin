import { Logger } from './logger';

function testLogger() {
  let logger = new Logger();
  logger.info('Info logging');
  logger.error('Error logging');

  logger = new Logger('[custom prefix]');
  logger.info('Info logging');
  logger.error('Error logging');

  const multiLines = `Multiline msg
  middle line
  footer
  `;
  logger.info(multiLines);

  // test not logging empty message
  logger.error('');
}

testLogger();
