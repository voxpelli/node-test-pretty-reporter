import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getErrorAndCauses } from '../lib/utils.js';

describe('Utils', () => {
  describe('getErrorAndCauses()', () => {
    it('should return a list of an error and all of its causes', () => {
      const err1 = new Error('Inner');
      const err2 = new Error('Middle', { cause: err1 });
      const err3 = new Error('Outer', { cause: err2 });

      const errorAndCauses = getErrorAndCauses(err3);

      assert(Array.isArray(errorAndCauses), 'An array is returned');
      assert(errorAndCauses.length === 3, 'The array has the correct length');
      assert.deepStrictEqual(errorAndCauses, [
        err3,
        err2,
        err1,
      ]);
    });
  });
});
