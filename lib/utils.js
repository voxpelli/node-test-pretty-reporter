/**
 * @template {Error} T
 * @param {T} value
 * @returns {[T, ...Error[]]}
 */
export function getErrorAndCauses (value) {
  /** @type {[T, ...Error[]]} */
  const seenErrors = [value];

  /** @type {Error} */
  let previousValue = value;

  while (previousValue.cause instanceof Error && !seenErrors.includes(previousValue.cause)) {
    seenErrors.push(previousValue.cause);
    previousValue = previousValue.cause;
  }

  return seenErrors;
}
