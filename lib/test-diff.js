import assert from 'node:assert/strict'

function runTest (desc, fn) {
  try {
    fn()
  } catch (err) {
    console.log(err.message)
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
