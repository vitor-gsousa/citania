// js/modules/arithmetic/primeFactorization.js
import { getRandomInt } from "../utils/rand.js";
import { isPrime, getPrimeFactors } from "../utils/math.js";

export function generatePrimeFactorization(level) {
  // Níveis: 1 - números até 20, 2 - até 50, 3 - até 100, 4 - até 200, 5+ - até 500
  let minNum, maxNum;
  if (level === 1) { minNum = 10; maxNum = 20; }
  else if (level === 2) { minNum = 15; maxNum = 50; }
  else if (level === 3) { minNum = 30; maxNum = 100; }
  else if (level === 4) { minNum = 50; maxNum = 200; }
  else { minNum = 100; maxNum = 500; }

  let number;
  do {
    number = getRandomInt(minNum, maxNum);
  } while (isPrime(number));

  const factors = getPrimeFactors(number);
  return {
    question: `Decompõe o número <span class="term-box">${number}</span> em fatores primos. (ex: 2 x 2 x 3)`,
    answer: factors,
    explanation: `Para decompor ${number}, dividimos sucessivamente por números primos: ${factors.join(" x ")}.`,
  };
}