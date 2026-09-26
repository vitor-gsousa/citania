import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateFractions, checkFractionAnswer } from '../js/modules/arithmetic/fractions.js';

describe('Fractions (js/modules/arithmetic/fractions.js)', () => {
  describe('generateFractions', () => {
    test('returns standard exercise structure', () => {
      const exercise = generateFractions(1);
      assert.equal(typeof exercise.question, 'string');
      assert.equal(typeof exercise.answer, 'string');
      assert.equal(typeof exercise.explanation, 'string');
      assert.ok(['exact', 'fraction'].includes(exercise.checkType));
      assert.equal(typeof exercise.visualData, 'object');
      assert.ok(exercise.visualData !== null);
    });

    test('generates valid problems across difficulty levels 1 through 8', () => {
      for (let level = 1; level <= 8; level++) {
        for (let i = 0; i < 20; i++) {
          const exercise = generateFractions(level);
          assert.ok(exercise.question.length > 0, `Question must not be empty at level ${level}`);
          assert.ok(exercise.answer.length > 0, `Answer must not be empty at level ${level}`);
          assert.ok(exercise.explanation.length > 0, `Explanation must not be empty at level ${level}`);
          assert.ok(exercise.visualData.type, `Visual data must have a type at level ${level}`);
        }
      }
    });
  });

  describe('checkFractionAnswer', () => {
    describe('checkType = exact', () => {
      test('validates comparison operators correctly', () => {
        assert.equal(checkFractionAnswer('>', '>', 'exact'), true);
        assert.equal(checkFractionAnswer('<', '<', 'exact'), true);
        assert.equal(checkFractionAnswer('=', '=', 'exact'), true);
        assert.equal(checkFractionAnswer('>', '<', 'exact'), false);
        assert.equal(checkFractionAnswer('<', '=', 'exact'), false);
      });

      test('validates numeric strings and values', () => {
        assert.equal(checkFractionAnswer('4', '4', 'exact'), true);
        assert.equal(checkFractionAnswer(' 4 ', '4', 'exact'), true);
        assert.equal(checkFractionAnswer('4', 4, 'exact'), true);
        assert.equal(checkFractionAnswer('5', 4, 'exact'), false);
      });
    });

    describe('checkType = fraction', () => {
      test('validates exact matching fractions', () => {
        assert.equal(checkFractionAnswer('1/2', '1/2', 'fraction'), true);
        assert.equal(checkFractionAnswer('3/4', '3/4', 'fraction'), true);
      });

      test('validates equivalent fractions (a/b == c/d if a*d == b*c)', () => {
        assert.equal(checkFractionAnswer('2/4', '1/2', 'fraction'), true);
        assert.equal(checkFractionAnswer('3/6', '1/2', 'fraction'), true);
        assert.equal(checkFractionAnswer('4/8', '2/4', 'fraction'), true);
        assert.equal(checkFractionAnswer('6/8', '3/4', 'fraction'), true);
      });

      test('handles whitespace within fraction string', () => {
        assert.equal(checkFractionAnswer(' 1 / 2 ', '1/2', 'fraction'), true);
        assert.equal(checkFractionAnswer('2 / 4', '1 / 2', 'fraction'), true);
      });

      test('rejects non-equivalent fractions', () => {
        assert.equal(checkFractionAnswer('1/3', '1/2', 'fraction'), false);
        assert.equal(checkFractionAnswer('2/3', '3/4', 'fraction'), false);
        assert.equal(checkFractionAnswer('5/4', '4/5', 'fraction'), false);
      });

      test('rejects malformed or invalid inputs safely', () => {
        assert.equal(checkFractionAnswer('', '1/2', 'fraction'), false);
        assert.equal(checkFractionAnswer('abc', '1/2', 'fraction'), false);
        assert.equal(checkFractionAnswer('1/2/3', '1/2', 'fraction'), false);
        assert.equal(checkFractionAnswer('1', '1/2', 'fraction'), false);
      });
    });

    test('returns false for unknown checkType', () => {
      assert.equal(checkFractionAnswer('1', '1', 'unknown'), false);
    });
  });
});
