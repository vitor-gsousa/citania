import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateFractionToDecimal } from '../js/modules/arithmetic/fractionToDecimal.js';

describe('Fraction to Decimal (js/modules/arithmetic/fractionToDecimal.js)', () => {
  test('returns standard exercise structure', () => {
    const exercise = generateFractionToDecimal(1);
    assert.equal(typeof exercise.question, 'string');
    assert.equal(typeof exercise.answer, 'number');
    assert.equal(typeof exercise.explanation, 'string');
    assert.equal(exercise.checkType, 'number');
    assert.equal(exercise.hasInlineInput, true);
  });

  test('generates valid problems across difficulty levels 1 through 5', () => {
    for (let level = 1; level <= 5; level++) {
      for (let i = 0; i < 20; i++) {
        const exercise = generateFractionToDecimal(level);
        assert.ok(Number.isFinite(exercise.answer), `Answer must be finite at level ${level}`);
        assert.ok(exercise.question.includes('fraction-display'), 'Question must include fraction display');
        assert.ok(exercise.explanation.length > 0, 'Explanation must not be empty');

        // Extract numerator and denominator from question HTML: <sup>NUM</sup>/<sub>DEN</sub>
        const match = exercise.question.match(/<sup>(\d+)<\/sup>\/<sub>(\d+)<\/sub>/);
        assert.ok(match, 'Must contain <sup>num</sup>/<sub>den</sub>');
        const num = Number(match[1]);
        const den = Number(match[2]);
        const expected = parseFloat((num / den).toFixed(4));
        assert.equal(exercise.answer, expected, `Answer must equal ${num}/${den}`);
      }
    }
  });

  test('validates decimal answer tolerance pattern used in exercise.js', () => {
    const checkDecimal = (userAnswer, correctAnswer) => {
      const userValue = parseFloat(String(userAnswer).replace(",", ".").trim());
      return Math.abs(userValue - correctAnswer) < 0.0001;
    };

    assert.equal(checkDecimal('0.5', 0.5), true);
    assert.equal(checkDecimal('0,5', 0.5), true);
    assert.equal(checkDecimal(' 0.75 ', 0.75), true);
    assert.equal(checkDecimal('0,125', 0.125), true);
    assert.equal(checkDecimal('0.50001', 0.5), true);
    assert.equal(checkDecimal('0.6', 0.5), false);
    assert.equal(checkDecimal('abc', 0.5), false);
  });
});
