import { errIsDiffable, generateErrDiff } from './diff.js';
import { getErrorAndCauses } from './utils.js';

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
    .map(value => formatError(format, value))
    .join('\n\ncaused by:\n\n');
}

/**
 * @param {import('markdown-or-chalk').MarkdownOrChalk} format
 * @param {Error} err
 * @returns {string}
 */
function formatError (format, err) {
  let message = err.message;
  let stack = (err.stack || '').replaceAll(/^\s+/gm, '');

  const index = stack.indexOf(message);

  if (index > -1) {
    const splitIndex = index + message.length;

    message = stack.slice(0, splitIndex);
    stack = stack.slice(splitIndex + 1);
  }

  if (format.chalk) {
    message = format.chalk.red(message);
    stack = format.chalk.gray(stack);
  }

  const diff = errIsDiffable(err) && err.showDiff !== false
    ? generateErrDiff(err)
    : undefined;

  return (
    diff
      ? [message, diff, stack]
      : [message, stack]
  ).join('\n\n');
}
