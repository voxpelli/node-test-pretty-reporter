import { MarkdownOrChalk } from 'markdown-or-chalk';
import { formatErrorAndCauses } from './errors.js';

const slowIfAboveMs = 75;

/**
 * @param {AsyncIterableIterator<import("./advanced-types.js").TestsStreamEventPayloads>} source
 * @returns {AsyncGenerator<string, void>}
 */
export default async function * customReporter (source) {
  const format = new MarkdownOrChalk(false);

  /** @type {import("./advanced-types.js").TestDiagnosticData[]} */
  const diagnostics = [];
  /** @type {Array<{ data: import("./advanced-types.js").TestFail, parentStack: import("./advanced-types.js").TestFileEvent[] }>} */
  const failures = [];
  /** @type {import("./advanced-types.js").TestFileEvent[]} */
  const parentStack = [];

  /** @type {import("./advanced-types.js").TestFileEvent[]} */
  let stack = [];

  for await (const event of source) {
    const { data, type } = event;

    if (
      type !== 'test:start' &&
      type !== 'test:pass' &&
      type !== 'test:fail' &&
      type !== 'test:plan' &&
      type !== 'test:diagnostic' &&
      type !== 'test:stdout' &&
      type !== 'test:stderr'
    ) {
      continue;
    }

    switch (type) {
      case 'test:start': {
        // Emitted when a test starts reporting its own and its subtests status. This event is guaranteed to be emitted in the same order as the tests are defined.
        stack.push(data);

        let closestParent = parentStack.at(-1);

        while (closestParent && closestParent.nesting >= data.nesting) {
          parentStack.pop();
          closestParent = parentStack.at(-1);
        }

        parentStack.push(data);

        break;
      }
      case 'test:pass':
      case 'test:fail':
        // Emitted when a test passes / fails.

        if (stack.length > 0) {
          if (stack.length > 1) {
            stack.pop();

            if (stack[0]?.nesting === 0) {
              yield '\n';
            }

            yield * printParentStack(stack);
          }

          stack = [];

          yield ''.padEnd((data.nesting + 1) * 2);

          if (type === 'test:pass') {
            const successMsg = `${format.logSymbols.success} ${data.name}`;

            yield format.chalk
              ? format.chalk.gray(successMsg)
              : successMsg;
          } else {
            failures.push({
              data,
              parentStack: [...parentStack],
            });

            const failureIndexHumanized = failures.length;
            const failMsg = `${failureIndexHumanized}) ${data.name}`;

            yield format.chalk
              ? format.chalk.red(failMsg)
              : failMsg;
          }

          if (data.details.duration_ms > slowIfAboveMs) {
            const durationMsg = format.italic(`(${Math.floor(data.details.duration_ms)}ms)`);

            yield ' ';
            yield format.chalk
              ? format.chalk.red(durationMsg)
              : durationMsg;
          }

          yield '\n';
        }

        break;
      case 'test:plan':
        // Emitted when all subtests have completed for a given test.
        break;
      case 'test:diagnostic':
        // Emitted when context.diagnostic is called.
        diagnostics.push(data);
        break;
      case 'test:stdout':
        process.stdout.write(data.message);
        break;
      case 'test:stderr':
        process.stderr.write(data.message);
        break;
    }
  }

  const diagnosticMessages = diagnostics.map(({ message }) => `${format.logSymbols.info} ${message}`).join('\n');
  yield '\n';
  yield format.chalk ? format.chalk.gray(diagnosticMessages) : diagnosticMessages;
  yield '\n\n';

  for (const [i, { data, parentStack }] of failures.entries()) {
    yield * printParentStack(parentStack, `${i + 1}) `, ':');
    yield '\n';
    yield format.indent(formatErrorAndCauses(format, data.details.error), 3);
    yield '\n\n';
  }
}

/**
 * @param {import("./advanced-types.js").TestFileEvent[]} parentStack
 * @param {string} [prefix]
 * @param {string} [suffix]
 * @returns {Generator<string, void>}
 */
function * printParentStack (parentStack, prefix = '', suffix = '') {
  const prefixLength = prefix.length;

  for (const [i, parentTest] of parentStack.entries()) {
    if (i !== 0) {
      yield '\n';
    }
    yield ''.padEnd((parentTest.nesting + 1) * 2 + (i ? prefixLength : 0));
    if (i === 0 && prefix) {
      yield prefix;
    }
    yield parentTest.name;
  }
  yield suffix + '\n';
}
