// js/modules/arithmetic/irreducibleFractions.js

/**
 * Gerador de exercícios de Frações Irredutíveis
 * Frações irredutíveis são aquelas que não podem ser mais simplificadas
 * porque o numerador e denominador não têm fatores comuns além de 1 (MDC = 1)
 */

import { getRandomInt } from '../utils/rand.js';
import { gcd } from '../utils/math.js';

/**
 * Gera um exercício de frações irredutíveis baseado no nível
 * @param {number} level - Nível de dificuldade (1-10+)
 * @returns {Object} Objeto com question, answer, explanation, visualData
 */
export function generateIrreducibleFractions(level) {
  const exerciseTypes = getIrreducibleExerciseTypes(level);
  const selectedType = exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];

  switch (selectedType) {
    case 'identify':
      return generateIdentifyIrreducible(level);
    case 'simplify':
      return generateSimplifyToIrreducible(level);
    case 'compare':
      return generateCompareIrreducible(level);
    default:
      return generateIdentifyIrreducible(level);
  }
}

/**
 * Determina quais tipos de exercícios são apropriados para cada nível
 * @param {number} level - Nível de dificuldade
 * @returns {Array} Array com tipos de exercícios disponíveis
 */
function getIrreducibleExerciseTypes(level) {
  if (level <= 3) {
    return ['identify'];
  } else if (level <= 6) {
    return ['identify', 'simplify'];
  } else {
    return ['identify', 'simplify', 'compare'];
  }
}

/**
 * Gera exercício: Identificar qual fração é irredutível
 * @param {number} level - Nível de dificuldade
 * @returns {Object} Exercício de identificação
 */
function generateIdentifyIrreducible(level) {
  let fractions = [];
  let correctIndex;

  // Gerar uma fração irredutível
  let num1, den1;
  do {
    den1 = getRandomInt(3, 12 + level);
    num1 = getRandomInt(1, den1 - 1);
  } while (gcd(num1, den1) !== 1); // Garantir que é irredutível

  fractions.push({ num: num1, den: den1, irreducible: true });

  // Gerar frações que NÃO são irredutíveis (simplificáveis)
  const numberOfFractions = level <= 3 ? 2 : 3;

  for (let i = 1; i < numberOfFractions; i++) {
    let denominator = getRandomInt(4, 15 + level);
    let divisor = getRandomInt(2, Math.min(5, Math.floor(denominator / 2)));
    
    // Criar fração não-irredutível multiplicando por um fator
    let numerator = getRandomInt(1, denominator / divisor - 1) * divisor;
    denominator = denominator / divisor * divisor;
    
    if (gcd(numerator, denominator) !== 1) {
      fractions.push({ num: numerator, den: denominator, irreducible: false });
    }
  }

  // Embaralhar e encontrar a posição da resposta correta
  const shuffled = fractions.sort(() => Math.random() - 0.5);
  correctIndex = shuffled.findIndex(f => f.irreducible);

  const numbers = ['1', '2', '3', '4'];
  const questionText = `Qual das seguintes frações é irredutível?`;
  
  const optionsHtml = shuffled
    .map((f, idx) => {
      return `<button class="option-button" data-option="${numbers[idx]}" aria-label="Opção ${numbers[idx]}: ${f.num}/${f.den}">
                <span class="option-number">${numbers[idx]}</span>
                <span class="option-content"><sup>${f.num}</sup>/<sub>${f.den}</sub></span>
              </button>`;
    })
    .join('');

  const questionHtml = `<div class="exercise-container">
    <p class="question-text">${questionText}</p>
    <div class="options-grid">
      ${optionsHtml}
    </div>
  </div>`;

  return {
    question: questionHtml,
    answer: numbers[correctIndex],
    explanation: `A fração ${shuffled[correctIndex].num}/${shuffled[correctIndex].den} é irredutível porque MDC(${shuffled[correctIndex].num}, ${shuffled[correctIndex].den}) = 1.\n\n` +
                 `As outras frações podem ser simplificadas:\n` +
                 shuffled
                   .filter((_, idx) => idx !== correctIndex)
                   .map(f => {
                     const divisor = gcd(f.num, f.den);
                     return `${f.num}/${f.den} = ${f.num/divisor}/${f.den/divisor} (dividido por ${divisor})`;
                   })
                   .join('\n'),
    checkType: 'exact',
    usesKeyboard: true, // Usa teclado numérico
    visualData: {
      type: 'irreducible-identify',
      fractions: shuffled,
      correctIndex: correctIndex,
      options: numbers.slice(0, numberOfFractions)
    }
  };
}

/**
 * Gera exercício: Simplificar uma fração até se tornar irredutível
 * @param {number} level - Nível de dificuldade
 * @returns {Object} Exercício de simplificação
 */
function generateSimplifyToIrreducible(level) {
  let numerator, denominator, simplifiedNum, simplifiedDen, divisor;

  if (level <= 4) {
    // Frações simples com fatores comuns óbvios
    divisor = getRandomInt(2, 4);
    simplifiedNum = getRandomInt(1, 6);
    simplifiedDen = getRandomInt(simplifiedNum + 1, 10);
    
    numerator = simplifiedNum * divisor;
    denominator = simplifiedDen * divisor;
  } else if (level <= 7) {
    // Frações mais complexas
    divisor = getRandomInt(2, 6);
    simplifiedNum = getRandomInt(1, 8);
    simplifiedDen = getRandomInt(simplifiedNum + 1, 15);
    
    numerator = simplifiedNum * divisor;
    denominator = simplifiedDen * divisor;
  } else {
    // Frações com múltiplos fatores primos
    const factor1 = getRandomInt(2, 5);
    const factor2 = getRandomInt(2, 5);
    divisor = factor1 * factor2;
    
    simplifiedNum = getRandomInt(1, 10);
    simplifiedDen = getRandomInt(simplifiedNum + 1, 20);
    
    numerator = simplifiedNum * divisor;
    denominator = simplifiedDen * divisor;
  }

  // Garantir que após simplificar fica irredutível
  while (gcd(simplifiedNum, simplifiedDen) !== 1) {
    simplifiedDen++;
  }

  return {
    question: `Simplifica a fração ${numerator}/${denominator} até se tornar irredutível:`,
    answer: `${simplifiedNum}/${simplifiedDen}`,
    explanation: `${numerator}/${denominator} = ${simplifiedNum}/${simplifiedDen}\n\n` +
                 `Divisor comum: ${divisor}\n` +
                 `${numerator} ÷ ${divisor} = ${simplifiedNum}\n` +
                 `${denominator} ÷ ${divisor} = ${simplifiedDen}\n\n` +
                 `A fração ${simplifiedNum}/${simplifiedDen} é irredutível porque MDC(${simplifiedNum}, ${simplifiedDen}) = 1`,
    checkType: 'fraction',
    usesKeyboard: true, // Usa teclado numérico com suporte a "/"
    visualData: {
      type: 'irreducible-simplify',
      original: { num: numerator, den: denominator },
      simplified: { num: simplifiedNum, den: simplifiedDen },
      divisor: divisor
    }
  };
}

/**
 * Gera exercício: Comparar frações irredutíveis
 * @param {number} level - Nível de dificuldade
 * @returns {Object} Exercício de comparação
 */
function generateCompareIrreducible(level) {
  // Gerar duas frações irredutíveis
  let num1, den1, num2, den2;
  
  do {
    den1 = getRandomInt(3, 12 + level);
    num1 = getRandomInt(1, den1 - 1);
  } while (gcd(num1, den1) !== 1);

  do {
    den2 = getRandomInt(3, 12 + level);
    num2 = getRandomInt(1, den2 - 1);
  } while (gcd(num2, den2) !== 1 || (num1 === num2 && den1 === den2));

  // Calcular qual é maior
  const value1 = num1 / den1;
  const value2 = num2 / den2;
  
  let comparison, answer;
  if (value1 > value2) {
    comparison = '>';
    answer = '1'; // Resposta por número: 1 para >
  } else if (value1 < value2) {
    comparison = '<';
    answer = '2'; // Resposta por número: 2 para <
  } else {
    comparison = '=';
    answer = '3'; // Resposta por número: 3 para =
  }

  return {
    question: `<div class="exercise-container">
      <p class="question-text">Compara as frações irredutíveis:</p>
      <div class="fraction-comparison">
        <span class="fraction"><sup>${num1}</sup>/<sub>${den1}</sub></span>
        <span class="comparison-symbol">___</span>
        <span class="fraction"><sup>${num2}</sup>/<sub>${den2}</sub></span>
      </div>
      <p class="instructions">Responde com:</p>
      <div class="options-grid">
        <button class="option-button" data-option="1" aria-label="Opção 1: Maior">
          <span class="option-number">1</span>
          <span class="option-content">&gt;</span>
        </button>
        <button class="option-button" data-option="2" aria-label="Opção 2: Menor">
          <span class="option-number">2</span>
          <span class="option-content">&lt;</span>
        </button>
        <button class="option-button" data-option="3" aria-label="Opção 3: Igual">
          <span class="option-number">3</span>
          <span class="option-content">=</span>
        </button>
      </div>
    </div>`,
    answer: answer,
    explanation: `${num1}/${den1} = ${value1.toFixed(4)}\n` +
                 `${num2}/${den2} = ${value2.toFixed(4)}\n\n` +
                 `Portanto: ${num1}/${den1} ${comparison} ${num2}/${den2}\n\n` +
                 `Ambas são frações irredutíveis (MDC = 1)`,
    checkType: 'exact',
    usesKeyboard: true, // Usa teclado numérico
    visualData: {
      type: 'irreducible-compare',
      fraction1: { num: num1, den: den1, value: value1 },
      fraction2: { num: num2, den: den2, value: value2 },
      comparison: comparison
    }
  };
}

/**
 * Verifica a resposta do utilizador para exercícios de frações irredutíveis
 * @param {string} userAnswer - Resposta do utilizador
 * @param {string} correctAnswer - Resposta correta
 * @param {string} checkType - Tipo de verificação ('exact', 'fraction', 'option')
 * @returns {boolean} True se a resposta está correta
 */
export function checkIrreducibleAnswer(userAnswer, correctAnswer, checkType = 'exact') {
  const answer = userAnswer.trim().toUpperCase();

  if (checkType === 'exact' || checkType === 'option') {
    // Para identificação e comparação
    return answer === correctAnswer.trim().toUpperCase();
  }

  if (checkType === 'fraction') {
    // Para simplificação: aceita formatos como "1/2" ou "1 / 2"
    const fractionRegex = /^\s*(\d+)\s*\/\s*(\d+)\s*$/;
    const userMatch = answer.match(fractionRegex);
    const correctMatch = correctAnswer.match(fractionRegex);

    if (!userMatch || !correctMatch) {
      return false;
    }

    const userNum = parseInt(userMatch[1], 10);
    const userDen = parseInt(userMatch[2], 10);
    const correctNum = parseInt(correctMatch[1], 10);
    const correctDen = parseInt(correctMatch[2], 10);

    // Verificar se a fração simplificada é equivalente à correta
    return userNum * correctDen === correctNum * userDen && gcd(userNum, userDen) === 1;
  }

  return false;
}
