import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getInlineInputHtml } from '../js/modules/utils/input-template.js';

describe('Input Template Utility (js/modules/utils/input-template.js)', () => {
  test('generates standard inline input with default aria-label', () => {
    const html = getInlineInputHtml();
    assert.equal(
      html,
      '<input type="text" class="fraction-missing-input inline-missing-input" autocomplete="off" inputmode="none" aria-label="Campo de resposta" />'
    );
  });

  test('generates inline input with custom aria-label when provided', () => {
    const html = getInlineInputHtml({ ariaLabel: 'Resposta personalizada' });
    assert.equal(
      html,
      '<input type="text" class="fraction-missing-input inline-missing-input" autocomplete="off" inputmode="none" aria-label="Resposta personalizada" />'
    );
  });
});
