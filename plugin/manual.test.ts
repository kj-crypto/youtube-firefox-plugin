import { ExcludePattern } from './exclude';
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

function testExcludePattern() {
  function test(target: string) {
    const src = excludePattern.getPattern();
    if (src === target) {
      console.log(`\x1b[32;1mOK:\x1b[0m ${target}`);
    } else {
      console.log(
        `\x1b[31;1mFAIL:\x1b[0m Source pattern \x1b[31;1m"${src}"\x1b[0m should equal target \x1b[33;1m"${target}"\x1b[0m`
      );
    }
  }

  let target = String.raw`'.*\.\(ts\|js\)$'`;
  let excludePattern = new ExcludePattern();
  test(target);

  target = String.raw`'.*\.\(html\|json\|ts\)$'`;
  excludePattern = new ExcludePattern(['.html', '*.json', 'ts']);
  test(target);
}

testLogger();
testExcludePattern();
