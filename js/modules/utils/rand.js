// js/modules/utils/rand.js
// Módulo ESM com helpers para aleatoriedade
/**
 * Retorna um inteiro aleatório entre min e max inclusive
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function getRandomInt(min, max) {
  min = Math.ceil(Number(min));
  max = Math.floor(Number(max));
  if (Number.isNaN(min) || Number.isNaN(max)) return 0;
  if (max < min) [min, max] = [max, min];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function choice(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  return arr[getRandomInt(0, arr.length - 1)];
}

export default { getRandomInt, choice };
