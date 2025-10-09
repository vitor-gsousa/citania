// js/modules/arithmetic/gcd.js
import { getRandomInt } from "../utils/rand.js";
import { gcd as calculateGcd } from "../utils/math.js";

// Exportar a função gcd para uso em outros módulos
export { calculateGcd as gcd };

export function generateGcd(level) {
  // Níveis: 1 - números pequenos, 2 - até 30, 3 - até 100, 4 - até 200, 5+ - até 500
  let min = 2, max = 10;
  if (level === 2) { min = 5; max = 30; }
  else if (level === 3) { min = 10; max = 100; }
  else if (level === 4) { min = 20; max = 200; }
  else if (level >= 5) { min = 50; max = 500; }

  const factor = getRandomInt(2, Math.max(3, Math.floor(max / 5)));
  const num1 = factor * getRandomInt(min, max);
  const num2 = factor * getRandomInt(min, max);
  const answer = calculateGcd(num1, num2);

  const inputHtml = `<input type="text" class="fraction-missing-input inline-missing-input" autocomplete="off" inputmode="none" aria-label="Campo de resposta" />`;

  return {
    question: `<span class="label">MDC(</span><span class="term-box">${num1}</span><span class="comma">, </span><span class="term-box">${num2}</span><span class="label">) = </span>${inputHtml}`,
    answer,
    explanation: `O MDC é o maior número que divide ${num1} e ${num2} sem deixar resto. Neste caso, a resposta é ${answer}.`,
    hasInlineInput: true,
  };
}