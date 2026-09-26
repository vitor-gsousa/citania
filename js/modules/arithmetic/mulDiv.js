// js/modules/arithmetic/mulDiv.js

/**
 * Gerador de exercícios de multiplicação e divisão
 * Adapta a dificuldade baseada no nível do utilizador
 */

import { getRandomInt } from '../utils/rand.js';
import { getInlineInputHtml } from '../utils/input-template.js';

/**
 * Gera um exercício de multiplicação ou divisão baseado no nível
 * @param {number} level - Nível de dificuldade (1-10+)
 * @returns {Object} Objeto com question, answer, explanation, checkType
 */
export function generateMulDiv(level) {
  // Determinar se será multiplicação ou divisão (50/50)
  const isMultiplication = Math.random() < 0.5;
  
  if (isMultiplication) {
    return generateMultiplication(level);
  } else {
    return generateDivision(level);
  }
}

/**
 * Gera exercício específico de multiplicação
 * @param {number} level - Nível de dificuldade
 * @returns {Object} Exercício de multiplicação
 */
function generateMultiplication(level) {
  let num1, num2, answer;
  
  // Adaptar a dificuldade baseada no nível
  if (level <= 2) {
    // Níveis 1-2: Multiplicação por números pequenos (1-5)
    num1 = getRandomInt(2, 9);
    num2 = getRandomInt(2, 5);
  } else if (level <= 4) {
    // Níveis 3-4: Tabuadas básicas (1-10)
    num1 = getRandomInt(2, 12);
    num2 = getRandomInt(2, 10);
  } else if (level <= 6) {
    // Níveis 5-6: Números de duas cifras
    num1 = getRandomInt(10, 25);
    num2 = getRandomInt(2, 12);
  } else if (level <= 8) {
    // Níveis 7-8: Multiplicações mais complexas
    num1 = getRandomInt(15, 50);
    num2 = getRandomInt(10, 20);
  } else {
    // Níveis 9+: Números grandes
    num1 = getRandomInt(25, 100);
    num2 = getRandomInt(15, 50);
  }
  
  answer = num1 * num2;
  
  // Criar input inline para resposta
  const inputHtml = getInlineInputHtml();
  
  return {
    question: `<span class="term-box">${num1}</span> <span class="op op-multiply">×</span> <span class="term-box">${num2}</span> <span class="equals">=</span> ${inputHtml}`,
    answer: answer,
    explanation: `${num1} × ${num2} = ${answer}`,
    checkType: 'exact',
    hasInlineInput: true
  };
}

/**
 * Gera exercício específico de divisão
 * @param {number} level - Nível de dificuldade
 * @returns {Object} Exercício de divisão
 */
function generateDivision(level) {
  let divisor, quotient, dividend, answer;
  
  // Adaptar a dificuldade baseada no nível
  if (level <= 2) {
    // Níveis 1-2: Divisões simples que resultam em números inteiros
    quotient = getRandomInt(2, 9);
    divisor = getRandomInt(2, 5);
  } else if (level <= 4) {
    // Níveis 3-4: Divisões básicas
    quotient = getRandomInt(2, 12);
    divisor = getRandomInt(2, 10);
  } else if (level <= 6) {
    // Níveis 5-6: Divisões com resultados maiores
    quotient = getRandomInt(5, 20);
    divisor = getRandomInt(3, 12);
  } else if (level <= 8) {
    // Níveis 7-8: Incluir algumas divisões com resto
    quotient = getRandomInt(10, 30);
    divisor = getRandomInt(4, 15);
    
    // 30% de chance de ter resto
    if (Math.random() < 0.3) {
      const remainder = getRandomInt(1, divisor - 1);
      dividend = quotient * divisor + remainder;
      const inputHtml = getInlineInputHtml();
      return {
        question: `<span class="term-box">${dividend}</span> <span class="op op-divide">÷</span> <span class="term-box">${divisor}</span> <span class="equals">=</span> ${inputHtml} <small>(parte inteira)</small>`,
        answer: quotient,
        explanation: `${dividend} ÷ ${divisor} = ${quotient} resto ${remainder}`,
        checkType: 'exact',
        hasInlineInput: true
      };
    }
  } else {
    // Níveis 9+: Divisões complexas
    quotient = getRandomInt(15, 50);
    divisor = getRandomInt(6, 25);
  }
  
  // Garantir divisão exata para níveis mais baixos
  dividend = quotient * divisor;
  answer = quotient;
  
  const inputHtml = getInlineInputHtml();
  
  return {
    question: `<span class="term-box">${dividend}</span> <span class="op op-divide">÷</span> <span class="term-box">${divisor}</span> <span class="equals">=</span> ${inputHtml}`,
    answer: answer,
    explanation: `${dividend} ÷ ${divisor} = ${answer}`,
    checkType: 'exact',
    hasInlineInput: true
  };
}
/**
 * Verifica se a resposta do utilizador está correta
 * @param {string|number} userAnswer - Resposta do utilizador
 * @param {number} correctAnswer - Resposta correta
 * @param {string} checkType - Tipo de verificação
 * @returns {boolean} True se a resposta estiver correta
 */
export function checkMulDivAnswer(userAnswer, correctAnswer, checkType) {
  // Converter para número e verificar
  const numericAnswer = parseFloat(userAnswer);
  
  if (isNaN(numericAnswer)) {
    return false;
  }
  
  if (checkType === 'exact') {
    return numericAnswer === correctAnswer;
  }
  
  // Fallback para verificação exata
  return numericAnswer === correctAnswer;
}