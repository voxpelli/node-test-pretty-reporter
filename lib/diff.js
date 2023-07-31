import { diff } from 'jest-diff';

/**
 * @typedef DiffableError
 * @property {unknown} expected
 * @property {unknown} actual
 * @property {boolean|undefined} [showDiff]
 */

/**
 * @template {Error} T
 * @param {T} input
 * @returns {input is (DiffableError & T)}
 */
export function errIsDiffable (input) {
  if (!('expected' in input)) return false;
  if (!('actual' in input)) return false;
  if (input.expected === undefined) return false;

  return true;
}

/**
 * @param {DiffableError} input
 * @returns {string|undefined}
 */
export function generateErrDiff ({ actual, expected }) {
  return diff(expected, actual) || undefined;
}
