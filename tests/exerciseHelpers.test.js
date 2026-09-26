import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, formatCorrectAnswer, extractUserAnswer } from '../js/exercise.js';

describe('Exercise Helper Functions (js/exercise.js)', () => {
  describe('escapeHtml', () => {
    test('escapes HTML special characters', () => {
      assert.equal(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      assert.equal(escapeHtml("Tom & 'Jerry'"), 'Tom &amp; &#39;Jerry&#39;');
    });

    test('handles numbers and falsy values safely', () => {
      assert.equal(escapeHtml(123), '123');
      assert.equal(escapeHtml(0), '0');
      assert.equal(escapeHtml(''), '');
    });
  });

  describe('formatCorrectAnswer', () => {
    test('formats array factors with multiplication symbol', () => {
      assert.equal(formatCorrectAnswer([2, 3, 5]), '2 x 3 x 5');
    });

    test('formats primitives and strings directly', () => {
      assert.equal(formatCorrectAnswer(42), '42');
      assert.equal(formatCorrectAnswer('1/2'), '1/2');
      assert.equal(formatCorrectAnswer(null), '');
      assert.equal(formatCorrectAnswer(undefined), '');
    });
  });

  describe('extractUserAnswer', () => {
    test('extracts from DOM.answerInput when no inline input', () => {
      const DOM = {
        exerciseArea: { querySelectorAll: () => [], querySelector: () => null },
        answerInput: { value: '42' },
      };
      const answer = extractUserAnswer(DOM, { hasInlineInput: false });
      assert.equal(answer, '42');
    });

    test('extracts from single inline input when hasInlineInput', () => {
      const DOM = {
        exerciseArea: {
          querySelectorAll: (sel) => sel === '.fraction-missing-input' ? [{ value: '3/4' }] : [],
          querySelector: () => null,
        },
        answerInput: { value: '' },
      };
      const answer = extractUserAnswer(DOM, { hasInlineInput: true });
      assert.equal(answer, '3/4');
    });

    test('combines numerator and denominator inputs for simplification', () => {
      const DOM = {
        exerciseArea: {
          querySelectorAll: (sel) => sel === '.fraction-missing-input' ? [{ value: '1' }, { value: '2' }] : [],
          querySelector: (sel) => {
            if (sel.includes('numerator')) return { value: '1' };
            if (sel.includes('denominator')) return { value: '2' };
            return null;
          },
        },
        answerInput: { value: '' },
      };
      const answer = extractUserAnswer(DOM, { hasInlineInput: true });
      assert.equal(answer, '1/2');
    });
  });
});
