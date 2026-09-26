// js/modules/utils/input-template.js
/**
 * Utilitário para geração de campos de resposta inline em exercícios.
 */

/**
 * Gera o markup HTML padronizado para campos de resposta inline nos exercícios.
 * @param {object} [options]
 * @param {string} [options.ariaLabel="Campo de resposta"]
 * @returns {string} Markup HTML do input inline
 */
export function getInlineInputHtml(options = {}) {
  const ariaLabel = options.ariaLabel || 'Campo de resposta';
  return `<input type="text" class="fraction-missing-input inline-missing-input" autocomplete="off" inputmode="none" aria-label="${ariaLabel}" />`;
}

export default { getInlineInputHtml };
