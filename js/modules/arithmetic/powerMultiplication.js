// js/modules/arithmetic/powerMultiplication.js
import { getRandomInt } from "../utils/rand.js";

export function generatePowerMultiplication(level) {
  // Níveis: 1 - bases pequenas, expoentes 2-3; 2 - bases até 6, expoentes até 4; 3+ - maiores
  let baseMin = 2, baseMax = 4, expMin = 2, expMax = 3;
  if (level === 2) { baseMax = 6; expMax = 4; }
  else if (level >= 3) { baseMax = 9; expMax = 5; }

  if (Math.random() < 0.5) {
    const base = getRandomInt(baseMin, baseMax);
    const exp1 = getRandomInt(expMin, expMax);
    const exp2 = getRandomInt(expMin, expMax);
    const finalExp = exp1 + exp2;
    return {
      question: `Qual é o resultado de <strong><span class="term-box">${base}<sup>${exp1}</sup></span> &times; <span class="term-box">${base}<sup>${exp2}</sup></span></strong>? <br><small>(responda na forma de potência, ex: 2^5)</small>`,
      answer: `${base}^${finalExp}`,
      explanation: `Para multiplicar potências com a mesma base, mantém-se a base (${base}) e somam-se os expoentes (${exp1} + ${exp2} = ${finalExp}).`,
      checkType: "string",
    };
  } else {
    let base1 = getRandomInt(baseMin, baseMax);
    let base2 = getRandomInt(baseMin, baseMax);
    if (base1 === base2) base2++;
    const exp1 = getRandomInt(expMin, expMax);
    const exp2 = getRandomInt(expMin, expMax);
    const result = Math.pow(base1, exp1) * Math.pow(base2, exp2);
    return {
      question: `Qual é o resultado de <strong><span class="term-box">${base1}<sup>${exp1}</sup></span> &times; <span class="term-box">${base2}<sup>${exp2}</sup></span></strong>?`,
      answer: result,
      explanation: `Como as bases são diferentes (${base1} e ${base2}), não podemos somar os expoentes. Calculamos o valor de cada potência e depois multiplicamos: ${base1 ** exp1} &times; ${base2 ** exp2} = ${result}.`,
      checkType: "number",
    };
  }
}