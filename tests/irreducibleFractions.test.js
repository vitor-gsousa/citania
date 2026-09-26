import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateIrreducibleFractions, checkIrreducibleAnswer } from '../js/modules/arithmetic/irreducibleFractions.js';

describe('Irreducible Fractions (js/modules/arithmetic/irreducibleFractions.js)', () => {
  describe('generateIrreducibleFractions', () => {
    test('returns standard exercise structure', () => {
      const exercise = generateIrreducibleFractions(1);
      assert.equal(typeof exercise.question, 'string');
      assert.equal(typeof exercise.answer, 'string');
      assert.equal(typeof exercise.explanation, 'string');
      assert.ok(['exact', 'fraction'].includes(exercise.checkType));
    });

    test('generates valid problems across difficulty levels 1 through 8', () => {
      for (let level = 1; level <= 8; level++) {
        for (let i = 0; i < 15; i++) {
          const exercise = generateIrreducibleFractions(level);
          assert.ok(exercise.question.length > 0, `Question must not be empty at level ${level}`);
          assert.ok(exercise.answer.length > 0, `Answer must not be empty at level ${level}`);
          assert.ok(exercise.explanation.length > 0, `Explanation must not be empty at level ${level}`);
        }
      }
    });
  });

  describe('checkIrreducibleAnswer', () => {
    describe('checkType = exact / option', () => {
      test('validates matching options (case-insensitive and trimmed)', () => {
        assert.equal(checkIrreducibleAnswer('1', '1', 'exact'), true);
        assert.equal(checkIrreducibleAnswer(' 2 ', '2', 'option'), true);
        assert.equal(checkIrreducibleAnswer('a', 'A', 'exact'), true);
        assert.equal(checkIrreducibleAnswer('>', '>', 'exact'), true);
      });

      test('rejects mismatched options', () => {
        assert.equal(checkIrreducibleAnswer('1', '2', 'exact'), false);
        assert.equal(checkIrreducibleAnswer('A', 'B', 'option'), false);
      });
    });

    describe('checkType = fraction', () => {
      test('accepts fraction only if equivalent AND irreducible (gcd === 1)', () => {
        // "1/2" is equivalent to "2/4" and gcd(1,2) === 1 -> valid
        assert.equal(checkIrreducibleAnswer('1/2', '2/4', 'fraction'), true);
        assert.equal(checkIrreducibleAnswer('2/3', '4/6', 'fraction'), true);
        assert.equal(checkIrreducibleAnswer('3/5', '9/15', 'fraction'), true);
      });

      test('rejects equivalent fraction if NOT irreducible (gcd > 1)', () => {
        // "2/4" is equivalent to "2/4", but is not irreducible (gcd=2) -> must fail!
        assert.equal(checkIrreducibleAnswer('2/4', '2/4', 'fraction'), false);
        assert.equal(checkIrreducibleAnswer('4/6', '2/3', 'fraction'), false);
      });

      test('rejects non-equivalent fractions', () => {
        assert.equal(checkIrreducibleAnswer('1/3', '2/4', 'fraction'), false);
        assert.equal(checkIrreducibleAnswer('3/4', '2/3', 'fraction'), false);
      });

      test('handles whitespace around slash', () => {
        assert.equal(checkIrreducibleAnswer(' 1 / 2 ', '2/4', 'fraction'), true);
      });

      test('rejects malformed inputs safely', () => {
        assert.equal(checkIrreducibleAnswer('abc', '1/2', 'fraction'), false);
        assert.equal(checkIrreducibleAnswer('', '1/2', 'fraction'), false);
        assert.equal(checkIrreducibleAnswer('1', '1/2', 'fraction'), false);
      });
    });

    test('returns false for unknown checkType', () => {
      assert.equal(checkIrreducibleAnswer('1', '1', 'unknown'), false);
    });
  });
});
