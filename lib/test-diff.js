import assert from 'node:assert/strict'

/**
 * @param {string} desc
 * @param {() => void} fn
 */

function runTest (desc, fn) {
  try {
    console.log(`Running: ${desc}`);
    fn()
  } catch (err) {
    console.log((/** @type {Error} */ (err)).message);
  }
}

runTest('🔥 assert.match() failure:', () => {
  assert.match('hello world', /bye/)
})

runTest('🔥 assert.doesNotMatch() failure:', () => {
  assert.doesNotMatch('secret sauce', /secret/)
})

runTest('🔥 deepStrictEqual() failure:', () => {
  assert.deepStrictEqual({ a: 1, b: 2 }, { a: 1, b: 3 })
})
