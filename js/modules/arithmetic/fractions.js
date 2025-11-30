// js/modules/arithmetic/fractions.js

/**
 * Gerador de exercícios de frações
 * Inclui operações básicas, simplificação, equivalências e comparações
 */

import { getRandomInt } from '../utils/rand.js';
import { gcd } from '../utils/math.js';

/**
 * Gera um exercício de frações baseado no nível
 * @param {number} level - Nível de dificuldade (1-10+)
 * @returns {Object} Objeto com question, answer, explanation, checkType, visualData
 */
export function generateFractions(level) {
  // Determinar tipo de exercício baseado no nível
  const exerciseTypes = getFractionExerciseTypes(level);
  const selectedType = exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];
  
  switch (selectedType) {
    case 'equivalent':
      return generateEquivalentFractions(level);
    case 'simplify':
      return generateSimplifyFraction(level);
    case 'add':
      return generateAddSubtractFractions(level, 'add');
    case 'subtract':
      return generateAddSubtractFractions(level, 'subtract');
    case 'multiply':
      return generateMultiplyFractions(level);
    case 'divide':
      return generateDivideFractions(level);
    case 'compare':
      return generateCompareFractions(level);
    default:
      return generateSimplifyFraction(level);
  }
}

/**
 * Determina quais tipos de exercícios são apropriados para cada nível
 * @param {number} level - Nível de dificuldade
 * @returns {Array} Array com tipos de exercícios disponíveis
 */
function getFractionExerciseTypes(level) {
  if (level <= 2) {
    return ['equivalent', 'simplify'];
  } else if (level <= 4) {
    return ['equivalent', 'simplify', 'compare'];
  } else if (level <= 6) {
    return ['equivalent', 'simplify', 'compare', 'add', 'subtract'];
  } else {
    return ['equivalent', 'simplify', 'compare', 'add', 'subtract', 'multiply', 'divide'];
  }
}

/**
 * Gera exercício de frações equivalentes
 * @param {number} level - Nível de dificuldade
 * @returns {Object} Exercício de frações equivalentes
 */
function generateEquivalentFractions(level) {
  let numerator, denominator, multiplier;
  
  if (level <= 2) {
    // Frações simples com denominadores pequenos
    denominator = getRandomInt(2, 6);
    numerator = getRandomInt(1, denominator - 1);
    multiplier = getRandomInt(2, 4);
  } else if (level <= 4) {
    denominator = getRandomInt(3, 8);
    numerator = getRandomInt(1, denominator - 1);
    multiplier = getRandomInt(2, 6);
  } else {
    denominator = getRandomInt(4, 12);
    numerator = getRandomInt(1, denominator - 1);
    multiplier = getRandomInt(3, 8);
  }
  
  const newNumerator = numerator * multiplier;
  const newDenominator = denominator * multiplier;
  
  // Decidir aleatoriamente se mostrar a primeira ou segunda fração
  const showFirst = Math.random() < 0.5;
  
  if (showFirst) {
    return {
      question: `Completa a equivalência:`,
      answer: newNumerator.toString(),
      explanation: `${numerator}/${denominator} = ${newNumerator}/${newDenominator} (multiplicado por ${multiplier})`,
      checkType: 'exact',
      hasInlineInput: true, // Sinalizar que este exercício usa input inline
      visualData: {
        type: 'equivalent',
        fraction1: { num: numerator, den: denominator },
        fraction2: { num: newNumerator, den: newDenominator },
        missing: 'numerator',
        question: `${numerator}/${denominator} = ?/${newDenominator}`
      }
    };
  } else {
    return {
      question: `Completa a equivalência:`,
      answer: newDenominator.toString(),
      explanation: `${numerator}/${denominator} = ${newNumerator}/${newDenominator} (multiplicado por ${multiplier})`,
      checkType: 'exact',
      hasInlineInput: true, // Sinalizar que este exercício usa input inline
      visualData: {
        type: 'equivalent',
        fraction1: { num: numerator, den: denominator },
        fraction2: { num: newNumerator, den: newDenominator },
        missing: 'denominator',
        question: `${numerator}/${denominator} = ${newNumerator}/?`
      }
    };
  }
}

/**
 * Gera exercício de simplificação de frações
 * @param {number} level - Nível de dificuldade
 * @returns {Object} Exercício de simplificação
 */
function generateSimplifyFraction(level) {
  let factor, numerator, denominator;
  
  if (level <= 2) {
    factor = getRandomInt(2, 4);
    numerator = getRandomInt(1, 5) * factor;
    denominator = getRandomInt(2, 6) * factor;
  } else if (level <= 4) {
    factor = getRandomInt(2, 6);
    numerator = getRandomInt(2, 8) * factor;
    denominator = getRandomInt(3, 10) * factor;
  } else {
    factor = getRandomInt(2, 8);
    numerator = getRandomInt(3, 12) * factor;
    denominator = getRandomInt(4, 15) * factor;
  }
  
  // Garantir que a fração não é imprópria nos níveis iniciais
  if (level <= 3 && numerator >= denominator) {
    numerator = denominator - factor;
  }
  
  const simplifiedNum = numerator / factor;
  const simplifiedDen = denominator / factor;
  
  return {
    question: `Simplifica a fração ${numerator}/${denominator}`,
    answer: `${simplifiedNum}/${simplifiedDen}`,
    explanation: `${numerator}/${denominator} = ${simplifiedNum}/${simplifiedDen} (dividido por ${factor})`,
    checkType: 'fraction',
    hasInlineInput: true,
    visualData: {
      type: 'simplify',
      original: { num: numerator, den: denominator },
      simplified: { num: simplifiedNum, den: simplifiedDen },
      factor: factor
    }
  };
}

/**
 * Gera exercício de adição ou subtração de frações
 * @param {number} level - Nível de dificuldade
 * @param {string} operation - 'add' ou 'subtract'
 * @returns {Object} Exercício de operação com frações
 */
function generateAddSubtractFractions(level, operation) {
  let num1, den1, num2, den2;
  
  if (level <= 4) {
    // Mesmo denominador para facilitar
    const commonDen = getRandomInt(3, 8);
    den1 = den2 = commonDen;
    num1 = getRandomInt(1, commonDen - 1);
    
    if (operation === 'add') {
      num2 = getRandomInt(1, commonDen - num1);
    } else {
      num2 = getRandomInt(1, num1); // Garantir resultado positivo
    }
  } else {
    // Denominadores diferentes
    den1 = getRandomInt(2, 6);
    den2 = getRandomInt(2, 6);
    while (den2 === den1) den2 = getRandomInt(2, 6);
    
    num1 = getRandomInt(1, den1);
    num2 = getRandomInt(1, den2);
  }
  
  const result = calculateFractionOperation(num1, den1, num2, den2, operation);
  const operator = operation === 'add' ? '+' : '-';
  const operatorText = operation === 'add' ? 'adição' : 'subtração';
  
  return {
    question: `Calcula: ${num1}/${den1} ${operator} ${num2}/${den2}`,
    answer: `${result.num}/${result.den}`,
    explanation: `${operatorText} de frações: ${num1}/${den1} ${operator} ${num2}/${den2} = ${result.num}/${result.den}`,
    checkType: 'fraction',
    visualData: {
      type: 'operation',
      fraction1: { num: num1, den: den1 },
      fraction2: { num: num2, den: den2 },
      operation: operation,
      result: result
    }
  };
}

/**
 * Gera exercício de multiplicação de frações
 * @param {number} level - Nível de dificuldade
 * @returns {Object} Exercício de multiplicação
 */
function generateMultiplyFractions(level) {
  let num1, den1, num2, den2;
  
  if (level <= 6) {
    num1 = getRandomInt(1, 4);
    den1 = getRandomInt(2, 6);
    num2 = getRandomInt(1, 4);
    den2 = getRandomInt(2, 6);
  } else {
    num1 = getRandomInt(1, 8);
    den1 = getRandomInt(2, 10);
    num2 = getRandomInt(1, 8);
    den2 = getRandomInt(2, 10);
  }
  
  const resultNum = num1 * num2;
  const resultDen = den1 * den2;
  const simplified = simplifyFraction(resultNum, resultDen);
  
  return {
    question: `Calcula: ${num1}/${den1} × ${num2}/${den2}`,
    answer: `${simplified.num}/${simplified.den}`,
    explanation: `Multiplicação: (${num1} × ${num2})/(${den1} × ${den2}) = ${resultNum}/${resultDen} = ${simplified.num}/${simplified.den}`,
    checkType: 'fraction',
    visualData: {
      type: 'operation',
      fraction1: { num: num1, den: den1 },
      fraction2: { num: num2, den: den2 },
      operation: 'multiply',
      result: simplified
    }
  };
}

/**
 * Gera exercício de divisão de frações
 * @param {number} level - Nível de dificuldade
 * @returns {Object} Exercício de divisão
 */
function generateDivideFractions(level) {
  let num1, den1, num2, den2;
  
  if (level <= 8) {
    num1 = getRandomInt(1, 6);
    den1 = getRandomInt(2, 8);
    num2 = getRandomInt(1, 4);
    den2 = getRandomInt(2, 6);
  } else {
    num1 = getRandomInt(2, 10);
    den1 = getRandomInt(3, 12);
    num2 = getRandomInt(1, 8);
    den2 = getRandomInt(2, 10);
  }
  
  // Multiplicar pela fração inversa
  const resultNum = num1 * den2;
  const resultDen = den1 * num2;
  const simplified = simplifyFraction(resultNum, resultDen);
  
  return {
    question: `Calcula: ${num1}/${den1} ÷ ${num2}/${den2}`,
    answer: `${simplified.num}/${simplified.den}`,
    explanation: `Divisão: ${num1}/${den1} × ${den2}/${num2} = ${resultNum}/${resultDen} = ${simplified.num}/${simplified.den}`,
    checkType: 'fraction',
    visualData: {
      type: 'operation',
      fraction1: { num: num1, den: den1 },
      fraction2: { num: num2, den: den2 },
      operation: 'divide',
      result: simplified
    }
  };
}

/**
 * Gera exercício de comparação de frações
 * @param {number} level - Nível de dificuldade
 * @returns {Object} Exercício de comparação
 */
function generateCompareFractions(level) {
  let num1, den1, num2, den2;
  
  if (level <= 3) {
    // Mesmo denominador
    const commonDen = getRandomInt(3, 8);
    den1 = den2 = commonDen;
    num1 = getRandomInt(1, commonDen);
    num2 = getRandomInt(1, commonDen);
    while (num2 === num1) num2 = getRandomInt(1, commonDen);
  } else {
    // Denominadores diferentes
    den1 = getRandomInt(2, 8);
    den2 = getRandomInt(2, 8);
    num1 = getRandomInt(1, den1);
    num2 = getRandomInt(1, den2);
  }
  
  const decimal1 = num1 / den1;
  const decimal2 = num2 / den2;
  let comparison, answer;
  
  if (decimal1 > decimal2) {
    comparison = '>';
    answer = '>';
  } else if (decimal1 < decimal2) {
    comparison = '<';
    answer = '<';
  } else {
    comparison = '=';
    answer = '=';
  }
  
  return {
    question: `Compara as frações: ${num1}/${den1} __ ${num2}/${den2} (usa >, < ou =)`,
    answer: answer,
    explanation: `${num1}/${den1} ${comparison} ${num2}/${den2} (${decimal1.toFixed(3)} ${comparison} ${decimal2.toFixed(3)})`,
    checkType: 'exact',
    visualData: {
      type: 'compare',
      fraction1: { num: num1, den: den1 },
      fraction2: { num: num2, den: den2 },
      comparison: comparison
    }
  };
}

/**
 * Calcula operação entre duas frações
 * @param {number} num1 - Numerador da primeira fração
 * @param {number} den1 - Denominador da primeira fração
 * @param {number} num2 - Numerador da segunda fração
 * @param {number} den2 - Denominador da segunda fração
 * @param {string} operation - Tipo de operação ('add' ou 'subtract')
 * @returns {Object} Resultado simplificado
 */
function calculateFractionOperation(num1, den1, num2, den2, operation) {
  // Calcular denominador comum
  const commonDen = (den1 * den2) / gcd(den1, den2);
  const newNum1 = num1 * (commonDen / den1);
  const newNum2 = num2 * (commonDen / den2);
  
  let resultNum;
  if (operation === 'add') {
    resultNum = newNum1 + newNum2;
  } else {
    resultNum = newNum1 - newNum2;
  }
  
  return simplifyFraction(resultNum, commonDen);
}

/**
 * Simplifica uma fração
 * @param {number} numerator - Numerador
 * @param {number} denominator - Denominador
 * @returns {Object} Fração simplificada
 */
function simplifyFraction(numerator, denominator) {
  const divisor = gcd(Math.abs(numerator), Math.abs(denominator));
  return {
    num: numerator / divisor,
    den: denominator / divisor
  };
}

/**
 * Verifica se a resposta do utilizador está correta
 * @param {string} userAnswer - Resposta do utilizador
 * @param {string} correctAnswer - Resposta correta
 * @param {string} checkType - Tipo de verificação
 * @returns {boolean} True se a resposta estiver correta
 */
export function checkFractionAnswer(userAnswer, correctAnswer, checkType) {
  if (checkType === 'exact') {
    // Para verificação exata, comparar tanto como string quanto como número
    const userTrimmed = userAnswer.trim();
    const correctTrimmed = correctAnswer.toString().trim();
    
    // Tentar comparar como string primeiro
    if (userTrimmed === correctTrimmed) {
      return true;
    }
    
    // Tentar comparar como número se for possível
    const userNum = parseFloat(userTrimmed);
    const correctNum = parseFloat(correctTrimmed);
    
    if (!isNaN(userNum) && !isNaN(correctNum)) {
      return userNum === correctNum;
    }
    
    return false;
  }
  
  if (checkType === 'fraction') {
    return checkFractionEquivalence(userAnswer, correctAnswer);
  }
  
  return false;
}

/**
 * Verifica se duas frações são equivalentes
 * @param {string} userFraction - Fração do utilizador (formato "num/den")
 * @param {string} correctFraction - Fração correta
 * @returns {boolean} True se as frações forem equivalentes
 */
function checkFractionEquivalence(userFraction, correctFraction) {
  try {
    const userParts = userFraction.trim().split('/');
    const correctParts = correctFraction.trim().split('/');
    
    if (userParts.length !== 2 || correctParts.length !== 2) {
      return false;
    }
    
    const userNum = parseInt(userParts[0], 10);
    const userDen = parseInt(userParts[1], 10);
    const correctNum = parseInt(correctParts[0], 10);
    const correctDen = parseInt(correctParts[1], 10);
    
    if (isNaN(userNum) || isNaN(userDen) || isNaN(correctNum) || isNaN(correctDen)) {
      return false;
    }
    
    // Verificar equivalência: a/b = c/d se a*d = b*c
    return (userNum * correctDen) === (userDen * correctNum);
  } catch (error) {
    return false;
  }
}

/**
 * Gera dica para ajudar o utilizador
 * @param {number} level - Nível atual
 * @param {string} question - Pergunta atual
 * @param {Object} visualData - Dados visuais do exercício
 * @returns {string} Dica para o utilizador
 */
export function getFractionHint(level, question, visualData) {
  if (!visualData) {
    return "💡 Dica: Lê a pergunta com atenção e pensa nas propriedades das frações.";
  }
  
  switch (visualData.type) {
    case 'equivalent':
      return "💡 Dica: Multiplica ou divide o numerador e denominador pelo mesmo número.";
    case 'simplify':
      return "💡 Dica: Encontra o maior divisor comum do numerador e denominador.";
    case 'operation':
      if (visualData.operation === 'add' || visualData.operation === 'subtract') {
        return "💡 Dica: Para somar/subtrair frações, usa um denominador comum.";
      } else if (visualData.operation === 'multiply') {
        return "💡 Dica: Multiplica numerador com numerador e denominador com denominador.";
      } else if (visualData.operation === 'divide') {
        return "💡 Dica: Para dividir frações, multiplica pela fração inversa.";
      }
      break;
    case 'compare':
      return "💡 Dica: Converte para decimais ou usa denominador comum para comparar.";
    default:
      return "💡 Dica: Pensa nas propriedades básicas das frações.";
  }
}