import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateAddSub } from '../js/modules/arithmetic/progression.js';

describe('Addition and Subtraction Progression (js/modules/arithmetic/progression.js)', () => {
  test('returns standard exercise structure', () => {
    const exercise = generateAddSub(1);
    assert.equal(typeof exercise.question, 'string');
    assert.equal(typeof exercise.answer, 'number');
    assert.equal(typeof exercise.explanation, 'string');
    assert.equal(exercise.checkType, 'number');
    assert.equal(exercise.hasInlineInput, true);
    assert.equal(typeof exercise.isMissingTerm, 'boolean');
  });

  test('generates valid problems across difficulty levels 1 through 8', () => {
    for (let level = 1; level <= 8; level++) {
      for (let i = 0; i < 25; i++) {
        const exercise = generateAddSub(level);
        assert.ok(Number.isFinite(exercise.answer), `Answer must be finite at level ${level}`);
        assert.ok(exercise.question.includes('inline-missing-input'), 'Question must include inline input');
        assert.ok(exercise.explanation.length > 0, 'Explanation must not be empty');
      }
    }
  });

  test('verifies equation equality for standard (non-missing-term) problems', () => {
    // For non-missing-term problems, question has: <span class="term-box">A</span> <span class="op op-add|sub">OP</span> <span class="term-box">B</span>
    for (let i = 0; i < 50; i++) {
      const exercise = generateAddSub(3);
      if (!exercise.isMissingTerm) {
        const terms = [...exercise.question.matchAll(/class="term-box">(-?\d+)<\/span>/g)].map(m => Number(m[1]));
        const isAdd = exercise.question.includes('op-add');
        assert.equal(terms.length, 2, 'Should have 2 term boxes for normal problem');
        const expected = isAdd ? terms[0] + terms[1] : terms[0] - terms[1];
        assert.equal(exercise.answer, expected, `Answer must equal ${terms[0]} ${isAdd ? '+' : '-'} ${terms[1]}`);
      }
    }
  });
});
