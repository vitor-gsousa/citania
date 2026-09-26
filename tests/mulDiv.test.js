import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateMulDiv, checkMulDivAnswer } from '../js/modules/arithmetic/mulDiv.js';

describe('Multiplication and Division (js/modules/arithmetic/mulDiv.js)', () => {
  describe('generateMulDiv', () => {
    test('returns standard exercise structure', () => {
      const exercise = generateMulDiv(1);
      assert.equal(typeof exercise.question, 'string');
      assert.equal(typeof exercise.answer, 'number');
      assert.equal(typeof exercise.explanation, 'string');
      assert.equal(exercise.checkType, 'exact');
      assert.equal(exercise.hasInlineInput, true);
    });

    test('generates valid problems across difficulty levels 1 through 9', () => {
      for (let level = 1; level <= 9; level++) {
        for (let i = 0; i < 20; i++) {
          const exercise = generateMulDiv(level);
          assert.ok(Number.isInteger(exercise.answer), `Answer must be an integer at level ${level}`);
          assert.ok(exercise.question.includes('inline-missing-input'), 'Question must include inline input');
          assert.ok(exercise.explanation.length > 0, 'Explanation must not be empty');
        }
      }
    });

    test('multiplication produces correct mathematical product', () => {
      for (let i = 0; i < 30; i++) {
        const exercise = generateMulDiv(2);
        if (exercise.question.includes('op-multiply')) {
          const terms = [...exercise.question.matchAll(/class="term-box">(\d+)<\/span>/g)].map(m => Number(m[1]));
          assert.equal(terms.length, 2);
          assert.equal(exercise.answer, terms[0] * terms[1]);
        }
      }
    });
  });

  describe('checkMulDivAnswer', () => {
    test('validates correct string and numeric inputs', () => {
      assert.equal(checkMulDivAnswer('42', 42, 'exact'), true);
      assert.equal(checkMulDivAnswer(' 42 ', 42, 'exact'), true);
      assert.equal(checkMulDivAnswer(42, 42, 'exact'), true);
    });

    test('rejects incorrect inputs', () => {
      assert.equal(checkMulDivAnswer('41', 42, 'exact'), false);
      assert.equal(checkMulDivAnswer('0', 42, 'exact'), false);
      assert.equal(checkMulDivAnswer('-42', 42, 'exact'), false);
    });

    test('rejects non-numeric and empty inputs', () => {
      assert.equal(checkMulDivAnswer('', 42, 'exact'), false);
      assert.equal(checkMulDivAnswer('   ', 42, 'exact'), false);
      assert.equal(checkMulDivAnswer('abc', 42, 'exact'), false);
      assert.equal(checkMulDivAnswer('null', 42, 'exact'), false);
    });
  });
});
