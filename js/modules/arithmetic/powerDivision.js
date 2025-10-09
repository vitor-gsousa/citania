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

  return {
    question: `Qual é o resultado de <strong><span class="term-box">${base}<sup>${exp1}</sup></span> &divide; <span class="term-box">${base}<sup>${exp2}</sup></span></strong>? <br><small>(responda na forma de potência, ex: 2^5)</small>`,
    answer: `${base}^${finalExp}`,
    explanation: `Para dividir potências com a mesma base, mantém-se a base (${base}) e subtraem-se os expoentes (${exp1} - ${exp2} = ${finalExp}).`,
  };
}