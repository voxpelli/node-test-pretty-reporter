import cleanStack from 'clean-stack';

import { errIsDiffable, generateErrDiff } from './diff.js';
import { getErrorAndCauses } from './utils.js';

// Borrowed from https://github.com/sindresorhus/extract-stack/blob/8d30fbbcd02053e4737e675d346137e6f1245263/index.js#L1C1-L1C39
const stackRegex = /(?:\n {4}at .*)+/;

const testRunnerStackRegex = /^ {4}at Test\.runInAsyncScope \(/m;

/**
 * @param {import('markdown-or-chalk').MarkdownOrChalk} format
 * @param {Error} err
 * @returns {string}
 */
export function formatErrorAndCauses (format, err) {
  if ('code' in err && err.code === 'ERR_TEST_FAILURE' && err.cause instanceof Error) {
    err = err.cause;
  }

  return getErrorAndCauses(err)
    .map((value, i) => format.indent(
      (i ? 'caused by:\n\n' : '') +
      formatError(format, value), i)
    )
    .join('\n\n');
}

/**
 * @param {import('markdown-or-chalk').MarkdownOrChalk} format
 * @param {Error} err
 * @returns {string}
 */
function formatError (format, err) {
  const messageFromStack = (err.stack || '').split('\n')[0];
  const extractedStack = (err.stack || '').match(stackRegex) || [];
  const testRunnerPrunedStack = extractedStack[0]?.slice(1).split(testRunnerStackRegex)[0] || '';

  let message = err.message.split('\n')[0] || '';
  let stack = cleanStack(testRunnerPrunedStack, {
    basePath: process.cwd(),
  })
    .replaceAll(/^\s+/gm, '');

  if (
    messageFromStack?.includes(message) &&
    err.name !== 'AssertionError'
  ) {
    message = messageFromStack;
  }

  if (format.chalk) {
    message = format.chalk.red(message);
    stack = format.chalk.gray(stack);
  }

  const diff = (errIsDiffable(err) && err.showDiff !== false)
    ? generateErrDiff(err)
    : undefined;

  return (
    diff
      ? [message, diff, stack]
      : [message, stack]
  ).join('\n\n');
}
