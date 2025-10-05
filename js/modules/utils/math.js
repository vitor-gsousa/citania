// js/modules/utils/math.js
// Módulo ESM com funções matemáticas utilitárias
/**
 * Calcula o máximo divisor comum (gcd)
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function gcd(a, b) {
  a = Math.abs(Number(a));
  b = Math.abs(Number(b));
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

/**
 * Calcula o mínimo múltiplo comum (lcm)
 */
export function lcm(a, b) {
  a = Number(a);
  b = Number(b);
  if (!a || !b) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

export function isPrime(num) {
  num = Number(num);
  if (!Number.isInteger(num) || num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0) return false;
  const limit = Math.floor(Math.sqrt(num));
  for (let i = 3; i <= limit; i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

export function getPrimeFactors(n) {
  n = Math.floor(Number(n));
  const factors = [];
  if (n <= 1) return factors;
  let d = 2;
  while (n >= d * d) {
    if (n % d === 0) {
      factors.push(d);
      n = n / d;
    } else {
      d = d === 2 ? 3 : d + 2;
    }
  }
  if (n > 1) factors.push(n);
  return factors;
}

export default { gcd, lcm, isPrime, getPrimeFactors };
