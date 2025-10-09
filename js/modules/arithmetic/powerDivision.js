// js/modules/arithmetic/powerDivision.js
import { getRandomInt } from "../utils/rand.js";

export function generatePowerDivision(level) {
  // Níveis: 1 - base pequena, expoentes 3-4; 2 - base até 6, expoentes até 6; 3+ - maiores
  let baseMin = 2, baseMax = 4, expMin = 3, expMax = 4;
  if (level === 2) { baseMax = 6; expMax = 6; }
  else if (level >= 3) { baseMax = 9; expMax = 8; }

  const base = getRandomInt(baseMin, baseMax);
  const exp1 = getRandomInt(expMin + 1, expMax + 1);
  const exp2 = getRandomInt(expMin, exp1 - 1);
  const finalExp = exp1 - exp2;

  const inputHtml = `<input type="text" class="fraction-missing-input inline-missing-input" autocomplete="off" inputmode="none" aria-label="Campo de resposta" />`;

  return {
    question: `<span class="term-box">${base}<sup>${exp1}</sup></span> <span class="op op-divide">÷</span> <span class="term-box">${base}<sup>${exp2}</sup></span> <span class="equals">=</span> ${inputHtml} <br><small>(ex: 2^5)</small>`,
    answer: `${base}^${finalExp}`,
    explanation: `Para dividir potências com a mesma base, mantém-se a base (${base}) e subtraem-se os expoentes (${exp1} - ${exp2} = ${finalExp}).`,
    hasInlineInput: true,
  };
}