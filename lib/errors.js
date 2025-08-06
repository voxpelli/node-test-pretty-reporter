import cleanStack from 'clean-stack';
import { errIsDiffable, generateErrDiff } from './diff.js';
import { getErrorAndCauses } from './utils.js';

// Borrowed from https://github.com/sindresorhus/extract-stack/blob/8d30fbbcd02053e4737e675d346137e6f1245263/index.js#L1C1-L1C39
const stackRegex = /(?:\n {4}at .*)+/;
const testRunnerStackRegex = /^ {4}at Test\.runInAsyncScope \(/m;

/**
 * Format error and any causes in a chain.
 * @param {import('markdown-or-chalk').MarkdownOrChalk} format
 * @param {Error} err
 * @returns {string}
 */
export function formatErrorAndCauses(format, err) {
  // Unwrap cause if it’s a known wrapper (Node test runner)
  if ('code' in err && err.code === 'ERR_TEST_FAILURE' && err.cause instanceof Error) {
    err = err.cause;
  }

  return getErrorAndCauses(err)
    .map((cause, i) => format.indent(
      (i ? 'caused by:\n\n' : '') + formatError(format, cause),
      i
    ))
    .join('\n\n');
}

/**
 * Format a single error with optional diff and cleaned stack.
 * @param {import('markdown-or-chalk').MarkdownOrChalk} format
 * @param {Error} err
 * @returns {string}
 */
function formatError(format, err) {
  const stackLines = (err.stack || '').split('\n');
  const messageFromStack = stackLines[0];
  const extractedStack = (err.stack || '').match(stackRegex) || [];
  const rawStack = extractedStack[0]?.slice(1).split(testRunnerStackRegex)[0] || '';

  let message = err.message?.split('\n')[0] || '';
  let stack = cleanStack(rawStack, {
    basePath: process.cwd(),
  }).replaceAll(/^\s+/gm, '');

  // If the stack's first line contains the message already, reuse it
  if (messageFromStack?.includes(message) && err.name !== 'AssertionError') {
    message = messageFromStack;
  }

  // Color formatting
  if (format.chalk) {
    message = format.chalk.red(message);
    stack = format.chalk.gray(stack);
  }

  //  Smart diff output (handles regex cases too)
  const diff = (errIsDiffable(err) && err.showDiff !== false)
    ? generateErrDiff(err)
    : undefined;

  return (
    diff
      ? [message, diff, stack]
      : [message, stack]
  ).join('\n\n');
}