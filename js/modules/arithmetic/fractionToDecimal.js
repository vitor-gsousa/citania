// js/modules/arithmetic/fractionToDecimal.js
import { getRandomInt } from "../utils/rand.js";

export function generateFractionToDecimal(level) {
  // Níveis: 1 - denominadores pequenos, 2 - numeradores maiores, 3+ - ambos maiores
  let cfg;
  if (level === 1) cfg = { numMin: 1, numMax: 9, denMin: 2, denMax: 9 };
  else if (level === 2) cfg = { numMin: 10, numMax: 20, denMin: 2, denMax: 10 };
  else if (level === 3) cfg = { numMin: 10, numMax: 50, denMin: 5, denMax: 20 };
  else if (level === 4) cfg = { numMin: 20, numMax: 99, denMin: 10, denMax: 30 };
  else cfg = { numMin: 50, numMax: 199, denMin: 10, denMax: 99 };

  let numerator, denominator;
  do {
    numerator = getRandomInt(cfg.numMin, cfg.numMax);
    denominator = getRandomInt(cfg.denMin, cfg.denMax);
  } while (numerator % denominator === 0 || denominator >= numerator);

  return {
    question: `Quanto é <span class="term-box">${numerator}</span>/<span class="term-box">${denominator}</span> em decimal? (arredonda às centésimas)`,
    answer: (numerator / denominator).toFixed(2),
    explanation: `Para converter ${numerator}/${denominator} para decimal, divide-se o numerador (${numerator}) pelo denominador (${denominator}). O resultado é ${(numerator / denominator).toFixed(3)}, que arredondado às centésimas fica ${(numerator / denominator).toFixed(2)}.`,
  };
}