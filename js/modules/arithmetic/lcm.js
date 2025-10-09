// js/modules/arithmetic/lcm.js
import { getRandomInt } from "../utils/rand.js";
import { lcm as calculateLcm } from "../utils/math.js";

// Exportar a função lcm para uso em outros módulos
export { calculateLcm as lcm };

export function generateLcm(level) {
  // Níveis: 1 - números pequenos, 2 - até 20, 3 - até 50, 4 - até 100, 5+ - até 200
  let min = 2, max = 10;
  if (level === 2) { min = 5; max = 20; }
  else if (level === 3) { min = 10; max = 50; }
  else if (level === 4) { min = 20; max = 100; }
  else if (level >= 5) { min = 50; max = 200; }

  const num1 = getRandomInt(min, max);
  const num2 = getRandomInt(min, max);
  const answer = calculateLcm(num1, num2);

  const inputHtml = `<input type="text" class="fraction-missing-input inline-missing-input" autocomplete="off" inputmode="none" aria-label="Campo de resposta" />`;

  return {
    question: `<span class="label">MMC(</span><span class="term-box">${num1}</span><span class="comma">, </span><span class="term-box">${num2}</span><span class="label">) = </span>${inputHtml}`,
    answer,
    explanation: `O MMC é o menor número que é múltiplo de ${num1} e de ${num2}. A resposta é ${answer}. Uma forma de calcular é (num1 * num2) / MDC(num1, num2).`,
    hasInlineInput: true,
  };
}