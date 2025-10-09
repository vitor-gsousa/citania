// js/modules/arithmetic/fractionToDecimal.js
/**
 * Gera exercícios de conversão de fração para decimal com progressão de dificuldade.
 *
 * Níveis de Dificuldade:
 * - Nível 1: Denominadores simples (2, 4, 5, 10) com resultados de 1-2 casas decimais.
 * - Nível 2: Denominadores (8, 20, 25, 50) com resultados de 2-3 casas decimais.
 * - Nível 3: Denominadores maiores (40, 100, 125) e numeradores maiores.
 * - Nível 4: Frações impróprias (numerador > denominador).
 * - Nível 5+: Frações mais complexas que ainda resultam em decimais finitos.
 */
import { getRandomInt, choice as getRandomElement } from "../utils/rand.js";

/**
 * Configuração de dificuldade por nível.
 * @param {number} level - O nível atual do jogador.
 * @returns {object} Configuração para o nível.
 */
function getLevelConfig(level) {
  switch (level) {
    case 1:
      // Frações simples, resultado com 1 ou 2 casas decimais. Ex: 1/2, 3/4, 2/5
      return {
        denominators: [2, 4, 5, 10],
        numeratorMax: (den) => den - 1, // Apenas frações próprias
        allowImproper: false,
      };
    case 2:
      // Denominadores que resultam em 2 ou 3 casas decimais. Ex: 5/8, 7/20
      return {
        denominators: [8, 20, 25, 50],
        numeratorMax: (den) => den - 1,
        allowImproper: false,
      };
    case 3:
      // Denominadores e numeradores maiores. Ex: 15/40, 30/125
      return {
        denominators: [40, 100, 125],
        numeratorMax: (den) => den - 1,
        allowImproper: false,
      };
    case 4:
      // Introdução a frações impróprias. Ex: 5/2, 12/10, 10/8
      return {
        denominators: [2, 4, 5, 8, 10],
        numeratorMax: (den) => den * 1.5, // Permite numerador > denominador
        allowImproper: true,
      };
    default:
      // Níveis avançados com maior variedade
      return {
        denominators: [2, 4, 5, 8, 10, 20, 25, 40, 50, 100, 125],
        numeratorMax: (den) => den * 2,
        allowImproper: true,
      };
  }
}

/**
 * Gera um exercício de conversão de fração para decimal.
 * @param {number} level - O nível de dificuldade.
 * @returns {{question: string, answer: number, explanation: string, checkType: string}}
 */
export function generateFractionToDecimal(level = 1) {
  const config = getLevelConfig(level);

  const denominator = getRandomElement(config.denominators);
  let numerator;

  // Garante que o numerador seja no mínimo 1
  do {
    const max = Math.floor(config.numeratorMax(denominator));
    numerator = getRandomInt(1, max > 1 ? max : 1);
  } while (numerator === 0);

  // Evitar frações que podem ser simplificadas para 1 (ex: 2/2) nos níveis iniciais
  if (level < 4 && numerator === denominator) {
    numerator = Math.max(1, numerator - 1);
  }

  const answer = numerator / denominator;

  // Formata a resposta para ter no máximo 4 casas decimais para evitar problemas de precisão
  const formattedAnswer = parseFloat(answer.toFixed(4));

  const inputHtml = `<input type="text" class="fraction-missing-input inline-missing-input" autocomplete="off" inputmode="none" aria-label="Campo de resposta" />`;
  const question = `<span class="fraction-display"><sup>${numerator}</sup>/<sub>${denominator}</sub></span> <span class="equals">=</span> ${inputHtml}`;

  const explanation = `Para converter a fração ${numerator}/${denominator} para decimal, divide-se o numerador (${numerator}) pelo denominador (${denominator}). O resultado é ${formattedAnswer}.`;

  return {
    question,
    answer: formattedAnswer,
    explanation,
    checkType: "number",
    hasInlineInput: true,
  };
}

export default {
  generateFractionToDecimal,
};