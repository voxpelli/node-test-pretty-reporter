import { describe, it } from 'node:test';

import chai from 'chai';

import { getErrorAndCauses } from '../lib/utils.js';

chai.should();

describe('Utils', () => {
  describe('getErrorAndCauses()', () => {
    it('should return a list of an error and all of its causes', () => {
      const err1 = new Error('Inner');
      const err2 = new Error('Middle', { cause: err1 });
      const err3 = new Error('Outer', { cause: err2 });

      const errorAndCauses = getErrorAndCauses(err3);

      errorAndCauses.should.be.an('array').of.length(3).that.deep.equals([
        err3,
        err2,
        err1,
      ]);
    });
  });
});
